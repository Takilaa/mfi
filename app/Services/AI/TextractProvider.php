<?php

namespace App\Services\AI;

use Aws\Textract\TextractClient;
use Aws\Exception\AwsException;
use Illuminate\Support\Facades\Log;
use Exception;

class TextractProvider implements AIProviderInterface
{
    private TextractClient $client;

    public function __construct()
    {
        $this->client = new TextractClient([
            'version' => 'latest',
            'region' => config('services.aws.region', 'us-east-1'),
            'credentials' => [
                'key' => config('services.aws.key'),
                'secret' => config('services.aws.secret'),
            ]
        ]);
    }

    public function extractData(string $filePath, string $category): array
    {
        try {
            $fileContent = file_get_contents($filePath);
            
            $result = $this->client->analyzeDocument([
                'Document' => [
                    'Bytes' => $fileContent
                ],
                'FeatureTypes' => ['TABLES', 'FORMS', 'SIGNATURES']
            ]);

            return $this->parseTextractResponse($result, $category);

        } catch (AwsException $e) {
            Log::error("Textract API error: {$e->getMessage()}");
            throw new Exception("Failed to extract data using Textract: {$e->getMessage()}");
        }
    }

    private function parseTextractResponse(array $result, string $category): array
    {
        $extractedData = [
            'raw_response' => $result,
            'text_blocks' => [],
            'tables' => [],
            'forms' => [],
            'signatures' => []
        ];

        $blocks = $result['Blocks'] ?? [];

        foreach ($blocks as $block) {
            switch ($block['BlockType']) {
                case 'LINE':
                    $extractedData['text_blocks'][] = [
                        'text' => $block['Text'] ?? '',
                        'confidence' => $block['Confidence'] ?? 0
                    ];
                    break;

                case 'TABLE':
                    $extractedData['tables'][] = $this->parseTable($block, $blocks);
                    break;

                case 'KEY_VALUE_SET':
                    if ($block['EntityTypes'][0] === 'KEY') {
                        $extractedData['forms'][] = $this->parseKeyValue($block, $blocks);
                    }
                    break;
            }
        }

        // Apply category-specific parsing
        return $this->applyCategorySpecificParsing($extractedData, $category);
    }

    private function parseTable(array $tableBlock, array $allBlocks): array
    {
        $table = [
            'rows' => [],
            'confidence' => $tableBlock['Confidence'] ?? 0
        ];

        // Implementation for table parsing would go here
        // This is a simplified version
        return $table;
    }

    private function parseKeyValue(array $keyBlock, array $allBlocks): array
    {
        // Implementation for key-value pair parsing
        return [
            'key' => '',
            'value' => '',
            'confidence' => $keyBlock['Confidence'] ?? 0
        ];
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
        $textBlocks = collect($data['text_blocks'])->pluck('text');
        
        return [
            'company_name' => $this->extractCompanyName($textBlocks),
            'registration_number' => $this->extractRegistrationNumber($textBlocks),
            'incorporation_date' => $this->extractIncorporationDate($textBlocks),
            'registered_address' => $this->extractRegisteredAddress($textBlocks),
            'directors' => $this->extractDirectors($textBlocks),
            'company_secretary' => $this->extractCompanySecretary($textBlocks),
            'authorized_capital' => $this->extractAuthorizedCapital($textBlocks),
            'issued_capital' => $this->extractIssuedCapital($textBlocks)
        ];
    }

    private function parseOwnershipDocument(array $data): array
    {
        return [
            'shareholders' => $this->extractShareholders($data),
            'shareholding_structure' => $this->extractShareholdingStructure($data),
            'capital_contributions' => $this->extractCapitalContributions($data),
            'net_worth_statements' => $this->extractNetWorthStatements($data)
        ];
    }

    private function parseGovernanceDocument(array $data): array
    {
        return [
            'board_members' => $this->extractBoardMembers($data),
            'management_team' => $this->extractManagementTeam($data),
            'qualifications' => $this->extractQualifications($data),
            'experience' => $this->extractExperience($data)
        ];
    }

    private function parseFinancialDocument(array $data): array
    {
        return [
            'audited_accounts' => $this->extractAuditedAccounts($data),
            'financial_projections' => $this->extractFinancialProjections($data),
            'loan_portfolio' => $this->extractLoanPortfolio($data),
            'insurance_policies' => $this->extractInsurancePolicies($data)
        ];
    }

    // Helper methods for extraction (simplified implementations)
    private function extractCompanyName($textBlocks): ?string
    {
        foreach ($textBlocks as $text) {
            if (preg_match('/company name[:\s]*(.+)/i', $text, $matches)) {
                return trim($matches[1]);
            }
        }
        return null;
    }

    private function extractRegistrationNumber($textBlocks): ?string
    {
        foreach ($textBlocks as $text) {
            if (preg_match('/registration\s+number[:\s]*([A-Z0-9\/\-]+)/i', $text, $matches)) {
                return trim($matches[1]);
            }
        }
        return null;
    }

    private function extractIncorporationDate($textBlocks): ?string
    {
        foreach ($textBlocks as $text) {
            if (preg_match('/incorporation\s+date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i', $text, $matches)) {
                return trim($matches[1]);
            }
        }
        return null;
    }

    private function extractRegisteredAddress($textBlocks): ?string
    {
        foreach ($textBlocks as $text) {
            if (preg_match('/registered\s+address[:\s]*(.+)/i', $text, $matches)) {
                return trim($matches[1]);
            }
        }
        return null;
    }

    private function extractDirectors($textBlocks): array
    {
        $directors = [];
        // Implementation would parse director information from text
        return $directors;
    }

    private function extractCompanySecretary($textBlocks): ?string
    {
        foreach ($textBlocks as $text) {
            if (preg_match('/company\s+secretary[:\s]*(.+)/i', $text, $matches)) {
                return trim($matches[1]);
            }
        }
        return null;
    }

    private function extractAuthorizedCapital($textBlocks): ?float
    {
        foreach ($textBlocks as $text) {
            if (preg_match('/authorized\s+capital[:\s]*[\$]?([\d,]+\.?\d*)/i', $text, $matches)) {
                return (float) str_replace(',', '', $matches[1]);
            }
        }
        return null;
    }

    private function extractIssuedCapital($textBlocks): ?float
    {
        foreach ($textBlocks as $text) {
            if (preg_match('/issued\s+capital[:\s]*[\$]?([\d,]+\.?\d*)/i', $text, $matches)) {
                return (float) str_replace(',', '', $matches[1]);
            }
        }
        return null;
    }

    private function extractShareholders($data): array
    {
        // Implementation for shareholder extraction from tables
        return [];
    }

    private function extractShareholdingStructure($data): array
    {
        // Implementation for shareholding structure extraction
        return [];
    }

    private function extractCapitalContributions($data): array
    {
        // Implementation for capital contributions extraction
        return [];
    }

    private function extractNetWorthStatements($data): array
    {
        // Implementation for net worth statements extraction
        return [];
    }

    private function extractBoardMembers($data): array
    {
        // Implementation for board members extraction
        return [];
    }

    private function extractManagementTeam($data): array
    {
        // Implementation for management team extraction
        return [];
    }

    private function extractQualifications($data): array
    {
        // Implementation for qualifications extraction
        return [];
    }

    private function extractExperience($data): array
    {
        // Implementation for experience extraction
        return [];
    }

    private function extractAuditedAccounts($data): array
    {
        // Implementation for audited accounts extraction
        return [];
    }

    private function extractFinancialProjections($data): array
    {
        // Implementation for financial projections extraction
        return [];
    }

    private function extractLoanPortfolio($data): array
    {
        // Implementation for loan portfolio extraction
        return [];
    }

    private function extractInsurancePolicies($data): array
    {
        // Implementation for insurance policies extraction
        return [];
    }

    public function getProviderName(): string
    {
        return 'AWS Textract';
    }

    public function isConfigured(): bool
    {
        return !empty(config('services.aws.key')) && !empty(config('services.aws.secret'));
    }
}
