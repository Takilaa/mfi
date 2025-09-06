<?php

namespace App\Services\AI;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Exception;

class FormRecognizerProvider implements AIProviderInterface
{
    private Client $httpClient;
    private string $endpoint;
    private string $apiKey;

    public function __construct()
    {
        $this->endpoint = config('services.azure.form_recognizer.endpoint');
        $this->apiKey = config('services.azure.form_recognizer.key');
        
        $this->httpClient = new Client([
            'timeout' => 60,
            'headers' => [
                'Ocp-Apim-Subscription-Key' => $this->apiKey,
                'Content-Type' => 'application/octet-stream'
            ]
        ]);
    }

    public function extractData(string $filePath, string $category): array
    {
        try {
            $fileContent = file_get_contents($filePath);
            
            // Use prebuilt model based on category
            $modelId = $this->getModelForCategory($category);
            $analyzeUrl = "{$this->endpoint}/formrecognizer/documentModels/{$modelId}:analyze?api-version=2023-07-31";

            // Submit document for analysis
            $response = $this->httpClient->post($analyzeUrl, [
                'body' => $fileContent
            ]);

            $operationLocation = $response->getHeader('Operation-Location')[0];
            
            // Poll for results
            $result = $this->pollForResults($operationLocation);
            
            return $this->parseFormRecognizerResponse($result, $category);

        } catch (RequestException $e) {
            Log::error("Form Recognizer API error: {$e->getMessage()}");
            throw new Exception("Failed to extract data using Form Recognizer: {$e->getMessage()}");
        }
    }

    private function getModelForCategory(string $category): string
    {
        return match ($category) {
            'corporate_registration' => 'prebuilt-document',
            'ownership_capital' => 'prebuilt-document', 
            'governance_personnel' => 'prebuilt-document',
            'financial_operational' => 'prebuilt-document',
            default => 'prebuilt-document'
        };
    }

    private function pollForResults(string $operationLocation): array
    {
        $maxAttempts = 30;
        $attempt = 0;
        
        while ($attempt < $maxAttempts) {
            $response = $this->httpClient->get($operationLocation);
            $result = json_decode($response->getBody()->getContents(), true);
            
            if ($result['status'] === 'succeeded') {
                return $result['analyzeResult'];
            }
            
            if ($result['status'] === 'failed') {
                throw new Exception("Form Recognizer analysis failed");
            }
            
            sleep(2);
            $attempt++;
        }
        
        throw new Exception("Form Recognizer analysis timed out");
    }

    private function parseFormRecognizerResponse(array $result, string $category): array
    {
        $extractedData = [
            'content' => $result['content'] ?? '',
            'pages' => $result['pages'] ?? [],
            'tables' => $result['tables'] ?? [],
            'key_value_pairs' => $result['keyValuePairs'] ?? [],
            'entities' => $result['entities'] ?? []
        ];

        return $this->applyCategorySpecificParsing($extractedData, $category);
    }

    private function applyCategorySpecificParsing(array $data, string $category): array
    {
        switch ($category) {
            case 'corporate_registration':
                return $this->parseCorporateDocument($data);
            case 'ownership_capital':
                return $this->parseOwnershipDocument($data);
            case 'governance_personnel':
                return $this->parseGovernanceDocument($data);
            case 'financial_operational':
                return $this->parseFinancialDocument($data);
            default:
                return $data;
        }
    }

    private function parseCorporateDocument(array $data): array
    {
        $keyValuePairs = $data['key_value_pairs'] ?? [];
        
        return [
            'company_name' => $this->findValueByKey($keyValuePairs, ['company name', 'name of company']),
            'registration_number' => $this->findValueByKey($keyValuePairs, ['registration number', 'reg no', 'company number']),
            'incorporation_date' => $this->findValueByKey($keyValuePairs, ['incorporation date', 'date of incorporation']),
            'registered_address' => $this->findValueByKey($keyValuePairs, ['registered address', 'address']),
            'directors' => $this->extractDirectorsFromTables($data['tables']),
            'authorized_capital' => $this->findValueByKey($keyValuePairs, ['authorized capital', 'authorised capital']),
            'issued_capital' => $this->findValueByKey($keyValuePairs, ['issued capital', 'paid up capital'])
        ];
    }

    private function parseOwnershipDocument(array $data): array
    {
        return [
            'shareholders' => $this->extractShareholdersFromTables($data['tables']),
            'shareholding_structure' => $this->extractShareholdingStructure($data['tables']),
            'capital_contributions' => $this->extractCapitalContributions($data['tables'])
        ];
    }

    private function parseGovernanceDocument(array $data): array
    {
        return [
            'board_members' => $this->extractBoardMembersFromTables($data['tables']),
            'management_team' => $this->extractManagementFromTables($data['tables']),
            'qualifications' => $this->extractQualifications($data['content'])
        ];
    }

    private function parseFinancialDocument(array $data): array
    {
        return [
            'audited_accounts' => $this->extractFinancialTables($data['tables'], 'balance sheet'),
            'financial_projections' => $this->extractFinancialTables($data['tables'], 'projection'),
            'loan_portfolio' => $this->extractFinancialTables($data['tables'], 'loan')
        ];
    }

    private function findValueByKey(array $keyValuePairs, array $possibleKeys): ?string
    {
        foreach ($keyValuePairs as $pair) {
            $key = strtolower($pair['key']['content'] ?? '');
            foreach ($possibleKeys as $searchKey) {
                if (strpos($key, strtolower($searchKey)) !== false) {
                    return $pair['value']['content'] ?? null;
                }
            }
        }
        return null;
    }

    private function extractDirectorsFromTables(array $tables): array
    {
        $directors = [];
        foreach ($tables as $table) {
            if ($this->isDirectorsTable($table)) {
                foreach ($table['cells'] as $cell) {
                    if ($this->isDirectorName($cell)) {
                        $directors[] = [
                            'name' => $cell['content'],
                            'position' => 'Director'
                        ];
                    }
                }
            }
        }
        return $directors;
    }

    private function extractShareholdersFromTables(array $tables): array
    {
        $shareholders = [];
        foreach ($tables as $table) {
            if ($this->isShareholderTable($table)) {
                $shareholders = array_merge($shareholders, $this->parseShareholderTable($table));
            }
        }
        return $shareholders;
    }

    private function extractShareholdingStructure(array $tables): array
    {
        return $this->extractShareholdersFromTables($tables);
    }

    private function extractCapitalContributions(array $tables): array
    {
        $contributions = [];
        foreach ($tables as $table) {
            if ($this->isCapitalTable($table)) {
                $contributions = array_merge($contributions, $this->parseCapitalTable($table));
            }
        }
        return $contributions;
    }

    private function extractBoardMembersFromTables(array $tables): array
    {
        return $this->extractDirectorsFromTables($tables);
    }

    private function extractManagementFromTables(array $tables): array
    {
        $management = [];
        foreach ($tables as $table) {
            if ($this->isManagementTable($table)) {
                $management = array_merge($management, $this->parseManagementTable($table));
            }
        }
        return $management;
    }

    private function extractQualifications(string $content): array
    {
        $qualifications = [];
        // Extract qualification patterns from content
        if (preg_match_all('/(?:degree|diploma|certificate|qualification)[:\s]*([^\n]+)/i', $content, $matches)) {
            $qualifications = $matches[1];
        }
        return $qualifications;
    }

    private function extractFinancialTables(array $tables, string $type): array
    {
        $financialData = [];
        foreach ($tables as $table) {
            if ($this->isFinancialTable($table, $type)) {
                $financialData[] = $this->parseFinancialTable($table);
            }
        }
        return $financialData;
    }

    private function isDirectorsTable(array $table): bool
    {
        $tableContent = $this->getTableContent($table);
        return stripos($tableContent, 'director') !== false;
    }

    private function isShareholderTable(array $table): bool
    {
        $tableContent = $this->getTableContent($table);
        return stripos($tableContent, 'shareholder') !== false || 
               stripos($tableContent, 'shares') !== false;
    }

    private function isCapitalTable(array $table): bool
    {
        $tableContent = $this->getTableContent($table);
        return stripos($tableContent, 'capital') !== false || 
               stripos($tableContent, 'contribution') !== false;
    }

    private function isManagementTable(array $table): bool
    {
        $tableContent = $this->getTableContent($table);
        return stripos($tableContent, 'management') !== false || 
               stripos($tableContent, 'executive') !== false;
    }

    private function isFinancialTable(array $table, string $type): bool
    {
        $tableContent = $this->getTableContent($table);
        return stripos($tableContent, $type) !== false;
    }

    private function getTableContent(array $table): string
    {
        $content = '';
        foreach ($table['cells'] ?? [] as $cell) {
            $content .= ' ' . ($cell['content'] ?? '');
        }
        return $content;
    }

    private function isDirectorName(array $cell): bool
    {
        $content = $cell['content'] ?? '';
        return !empty($content) && 
               !is_numeric($content) && 
               strlen($content) > 2 &&
               preg_match('/^[a-zA-Z\s]+$/', $content);
    }

    private function parseShareholderTable(array $table): array
    {
        // Implementation for parsing shareholder table structure
        return [];
    }

    private function parseCapitalTable(array $table): array
    {
        // Implementation for parsing capital table structure
        return [];
    }

    private function parseManagementTable(array $table): array
    {
        // Implementation for parsing management table structure
        return [];
    }

    private function parseFinancialTable(array $table): array
    {
        // Implementation for parsing financial table structure
        return [];
    }

    public function getProviderName(): string
    {
        return 'Azure Form Recognizer';
    }

    public function isConfigured(): bool
    {
        return !empty($this->endpoint) && !empty($this->apiKey);
    }
}
