<?php

namespace App\Services\AI;

use Google\Cloud\DocumentAI\V1\DocumentProcessorServiceClient;
use Google\Cloud\DocumentAI\V1\RawDocument;
use Google\Cloud\DocumentAI\V1\ProcessRequest;
use Illuminate\Support\Facades\Log;
use Exception;

class DocumentAIProvider implements AIProviderInterface
{
    private DocumentProcessorServiceClient $client;
    private string $projectId;
    private string $location;
    private string $processorId;

    public function __construct()
    {
        $this->projectId = config('services.google.project_id');
        $this->location = config('services.google.location', 'us');
        $this->processorId = config('services.google.processor_id');
        
        $this->client = new DocumentProcessorServiceClient([
            'credentials' => config('services.google.credentials_path')
        ]);
    }

    public function extractData(string $filePath, string $category): array
    {
        try {
            $fileContent = file_get_contents($filePath);
            $mimeType = mime_content_type($filePath);

            $rawDocument = new RawDocument([
                'content' => $fileContent,
                'mime_type' => $mimeType
            ]);

            $name = $this->client->processorName($this->projectId, $this->location, $this->processorId);
            
            $request = new ProcessRequest([
                'name' => $name,
                'raw_document' => $rawDocument
            ]);

            $response = $this->client->processDocument($request);
            $document = $response->getDocument();

            return $this->parseDocumentAIResponse($document, $category);

        } catch (Exception $e) {
            Log::error("Document AI error: {$e->getMessage()}");
            throw new Exception("Failed to extract data using Document AI: {$e->getMessage()}");
        }
    }

    private function parseDocumentAIResponse($document, string $category): array
    {
        $extractedData = [
            'text' => $document->getText(),
            'entities' => [],
            'tables' => [],
            'pages' => []
        ];

        // Extract entities
        foreach ($document->getEntities() as $entity) {
            $extractedData['entities'][] = [
                'type' => $entity->getType(),
                'mention_text' => $entity->getMentionText(),
                'confidence' => $entity->getConfidence()
            ];
        }

        // Extract tables
        foreach ($document->getPages() as $page) {
            foreach ($page->getTables() as $table) {
                $extractedData['tables'][] = $this->parseTable($table);
            }
        }

        return $this->applyCategorySpecificParsing($extractedData, $category);
    }

    private function parseTable($table): array
    {
        $tableData = ['rows' => []];
        
        foreach ($table->getHeaderRows() as $headerRow) {
            $row = [];
            foreach ($headerRow->getCells() as $cell) {
                $row[] = $this->getCellText($cell);
            }
            $tableData['header'] = $row;
        }

        foreach ($table->getBodyRows() as $bodyRow) {
            $row = [];
            foreach ($bodyRow->getCells() as $cell) {
                $row[] = $this->getCellText($cell);
            }
            $tableData['rows'][] = $row;
        }

        return $tableData;
    }

    private function getCellText($cell): string
    {
        $text = '';
        foreach ($cell->getLayout()->getTextAnchor()->getTextSegments() as $segment) {
            $text .= substr($cell->getLayout()->getTextAnchor()->getContent(), 
                           $segment->getStartIndex(), 
                           $segment->getEndIndex() - $segment->getStartIndex());
        }
        return trim($text);
    }

    private function applyCategorySpecificParsing(array $data, string $category): array
    {
        // Similar category-specific parsing as TextractProvider
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
        return [
            'company_name' => $this->extractEntityByType($data['entities'], 'ORGANIZATION'),
            'registration_number' => $this->extractEntityByType($data['entities'], 'REGISTRATION_NUMBER'),
            'incorporation_date' => $this->extractEntityByType($data['entities'], 'DATE'),
            'registered_address' => $this->extractEntityByType($data['entities'], 'ADDRESS'),
            'directors' => $this->extractEntityByType($data['entities'], 'PERSON'),
        ];
    }

    private function parseOwnershipDocument(array $data): array
    {
        return [
            'shareholders' => $this->extractShareholdersFromTables($data['tables']),
            'shareholding_structure' => [],
            'capital_contributions' => [],
        ];
    }

    private function parseGovernanceDocument(array $data): array
    {
        return [
            'board_members' => $this->extractEntityByType($data['entities'], 'PERSON'),
            'management_team' => [],
            'qualifications' => [],
        ];
    }

    private function parseFinancialDocument(array $data): array
    {
        return [
            'audited_accounts' => $this->extractFinancialDataFromTables($data['tables']),
            'financial_projections' => [],
            'loan_portfolio' => [],
        ];
    }

    private function extractEntityByType(array $entities, string $type): ?string
    {
        foreach ($entities as $entity) {
            if ($entity['type'] === $type) {
                return $entity['mention_text'];
            }
        }
        return null;
    }

    private function extractShareholdersFromTables(array $tables): array
    {
        $shareholders = [];
        foreach ($tables as $table) {
            if ($this->isShareholderTable($table)) {
                foreach ($table['rows'] as $row) {
                    if (count($row) >= 3) {
                        $shareholders[] = [
                            'name' => $row[0] ?? '',
                            'shares' => $this->parseNumber($row[1] ?? '0'),
                            'percentage' => $this->parsePercentage($row[2] ?? '0%')
                        ];
                    }
                }
            }
        }
        return $shareholders;
    }

    private function extractFinancialDataFromTables(array $tables): array
    {
        $financialData = [];
        foreach ($tables as $table) {
            if ($this->isFinancialTable($table)) {
                // Extract financial data from table structure
                $financialData[] = $table;
            }
        }
        return $financialData;
    }

    private function isShareholderTable(array $table): bool
    {
        $header = $table['header'] ?? [];
        $headerText = strtolower(implode(' ', $header));
        return strpos($headerText, 'shareholder') !== false || 
               strpos($headerText, 'shares') !== false;
    }

    private function isFinancialTable(array $table): bool
    {
        $header = $table['header'] ?? [];
        $headerText = strtolower(implode(' ', $header));
        return strpos($headerText, 'amount') !== false || 
               strpos($headerText, 'balance') !== false ||
               strpos($headerText, 'revenue') !== false;
    }

    private function parseNumber(string $text): float
    {
        return (float) preg_replace('/[^\d.]/', '', $text);
    }

    private function parsePercentage(string $text): float
    {
        return (float) preg_replace('/[^\d.]/', '', $text);
    }

    public function getProviderName(): string
    {
        return 'Google Document AI';
    }

    public function isConfigured(): bool
    {
        return !empty($this->projectId) && 
               !empty($this->processorId) && 
               !empty(config('services.google.credentials_path'));
    }
}
