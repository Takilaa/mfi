<?php

namespace App\Services;

use App\Models\Document;
use App\Models\Application;
use App\Services\AI\AIProviderInterface;
use App\Services\AI\TextractProvider;
use App\Services\AI\DocumentAIProvider;
use App\Services\AI\FormRecognizerProvider;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Exception;

class DocumentProcessingService
{
    private AIProviderInterface $aiProvider;
    
    public function __construct()
    {
        $this->aiProvider = $this->getAIProvider();
    }

    /**
     * Process uploaded document with AI extraction
     */
    public function processDocument(Document $document): array
    {
        try {
            // 1. Validate file exists
            if (!Storage::exists($document->file_path)) {
                throw new Exception("Document file not found: {$document->file_path}");
            }

            // 2. Get file content
            $fileContent = Storage::get($document->file_path);
            $filePath = Storage::path($document->file_path);

            // 3. Send to AI provider for extraction
            Log::info("Starting AI extraction for document: {$document->id}");
            $extractedData = $this->aiProvider->extractData($filePath, $document->category);

            // 4. Map extracted data to application fields
            $mappedData = $this->mapExtractedData($extractedData, $document->category);

            // 5. Update document with extraction results
            $document->update([
                'extraction_status' => 'completed',
                'extracted_data' => $extractedData,
                'mapped_data' => $mappedData,
                'processed_at' => now()
            ]);

            // 6. Auto-fill application form if possible
            if ($document->application_id) {
                $this->autoFillApplication($document->application, $mappedData);
            }

            Log::info("AI extraction completed for document: {$document->id}");
            
            return [
                'success' => true,
                'extracted_data' => $extractedData,
                'mapped_data' => $mappedData
            ];

        } catch (Exception $e) {
            Log::error("Document processing failed: {$e->getMessage()}", [
                'document_id' => $document->id,
                'error' => $e->getMessage()
            ]);

            $document->update([
                'extraction_status' => 'failed',
                'error_message' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Map extracted data to application form fields based on document category
     */
    private function mapExtractedData(array $extractedData, string $category): array
    {
        $mappedData = [];

        switch ($category) {
            case 'corporate_registration':
                $mappedData = $this->mapCorporateData($extractedData);
                break;
            
            case 'ownership_capital':
                $mappedData = $this->mapOwnershipData($extractedData);
                break;
            
            case 'governance_personnel':
                $mappedData = $this->mapGovernanceData($extractedData);
                break;
            
            case 'financial_operational':
                $mappedData = $this->mapFinancialData($extractedData);
                break;
        }

        return $mappedData;
    }

    /**
     * Map corporate registration document data
     */
    private function mapCorporateData(array $data): array
    {
        return [
            'company_name' => $data['company_name'] ?? null,
            'registration_number' => $data['registration_number'] ?? null,
            'incorporation_date' => $data['incorporation_date'] ?? null,
            'registered_address' => $data['registered_address'] ?? null,
            'directors' => $data['directors'] ?? [],
            'company_secretary' => $data['company_secretary'] ?? null,
            'authorized_capital' => $data['authorized_capital'] ?? null,
            'issued_capital' => $data['issued_capital'] ?? null
        ];
    }

    /**
     * Map ownership and capital document data
     */
    private function mapOwnershipData(array $data): array
    {
        return [
            'shareholders' => $data['shareholders'] ?? [],
            'shareholding_structure' => $data['shareholding_structure'] ?? [],
            'capital_contributions' => $data['capital_contributions'] ?? [],
            'net_worth_statements' => $data['net_worth_statements'] ?? [],
            'ownership_percentages' => $data['ownership_percentages'] ?? []
        ];
    }

    /**
     * Map governance and personnel document data
     */
    private function mapGovernanceData(array $data): array
    {
        return [
            'board_members' => $data['board_members'] ?? [],
            'management_team' => $data['management_team'] ?? [],
            'qualifications' => $data['qualifications'] ?? [],
            'experience' => $data['experience'] ?? [],
            'vetting_results' => $data['vetting_results'] ?? []
        ];
    }

    /**
     * Map financial and operational document data
     */
    private function mapFinancialData(array $data): array
    {
        return [
            'audited_accounts' => $data['audited_accounts'] ?? [],
            'financial_projections' => $data['financial_projections'] ?? [],
            'loan_portfolio' => $data['loan_portfolio'] ?? [],
            'insurance_policies' => $data['insurance_policies'] ?? [],
            'operational_procedures' => $data['operational_procedures'] ?? []
        ];
    }

    /**
     * Auto-fill application form with mapped data
     */
    private function autoFillApplication(Application $application, array $mappedData): void
    {
        $currentData = $application->form_data ?? [];
        
        // Merge mapped data with existing form data (don't overwrite user inputs)
        $updatedData = array_merge($mappedData, $currentData);
        
        $application->update([
            'form_data' => $updatedData,
            'auto_filled_at' => now()
        ]);
    }

    /**
     * Get configured AI provider
     */
    private function getAIProvider(): AIProviderInterface
    {
        $provider = config('services.ai.provider', 'textract');

        return match ($provider) {
            'textract' => new TextractProvider(),
            'document_ai' => new DocumentAIProvider(),
            'form_recognizer' => new FormRecognizerProvider(),
            default => new TextractProvider()
        };
    }

    /**
     * Batch process multiple documents
     */
    public function batchProcessDocuments(array $documentIds): array
    {
        $results = [];
        
        foreach ($documentIds as $documentId) {
            $document = Document::find($documentId);
            if ($document) {
                $results[$documentId] = $this->processDocument($document);
            }
        }
        
        return $results;
    }

    /**
     * Get processing status for documents
     */
    public function getProcessingStatus(array $documentIds): array
    {
        return Document::whereIn('id', $documentIds)
            ->select('id', 'extraction_status', 'processed_at', 'error_message')
            ->get()
            ->keyBy('id')
            ->toArray();
    }
}
