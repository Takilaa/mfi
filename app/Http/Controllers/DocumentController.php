<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Application;
use App\Services\DocumentProcessingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class DocumentController extends Controller
{
    private DocumentProcessingService $documentService;

    public function __construct(DocumentProcessingService $documentService)
    {
        $this->documentService = $documentService;
    }

    /**
     * Upload document and trigger AI processing
     */
    public function upload(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240', // 10MB max
            'application_id' => 'required|exists:applications,id',
            'category' => 'required|string',
            'document_type' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $application = Application::findOrFail($request->application_id);
            
            // Check if user owns this application
            if ($application->user_id !== auth()->id() && !auth()->user()->isRegistrar()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to application'
                ], 403);
            }

            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('documents/' . $application->id, $filename);

            // Create document record
            $document = Document::create([
                'application_id' => $application->id,
                'category' => $request->category,
                'document_type' => $request->document_type,
                'original_filename' => $file->getClientOriginalName(),
                'file_path' => $path,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'extraction_status' => 'pending',
                'is_mandatory' => $this->isMandatoryDocument($request->category, $request->document_type)
            ]);

            // Trigger AI processing asynchronously
            dispatch(function () use ($document) {
                $this->documentService->processDocument($document);
            })->afterResponse();

            return response()->json([
                'success' => true,
                'document_id' => $document->id,
                'message' => 'Document uploaded successfully. AI processing started.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get document processing status
     */
    public function status(Document $document): JsonResponse
    {
        // Check access permissions
        if ($document->application->user_id !== auth()->id() && !auth()->user()->isRegistrar()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        return response()->json([
            'document_id' => $document->id,
            'extraction_status' => $document->extraction_status,
            'extracted_data' => $document->extracted_data,
            'mapped_data' => $document->mapped_data,
            'error_message' => $document->error_message,
            'processed_at' => $document->processed_at
        ]);
    }

    /**
     * Get all documents for an application
     */
    public function index(Application $application): JsonResponse
    {
        // Check access permissions
        if ($application->user_id !== auth()->id() && !auth()->user()->isRegistrar()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $documents = $application->documents()
            ->select(['id', 'category', 'document_type', 'original_filename', 'file_size', 'extraction_status', 'is_mandatory', 'created_at'])
            ->get()
            ->groupBy('category');

        return response()->json([
            'success' => true,
            'documents' => $documents
        ]);
    }

    /**
     * Download document
     */
    public function download(Document $document)
    {
        // Check access permissions
        if ($document->application->user_id !== auth()->id() && !auth()->user()->isRegistrar()) {
            abort(403, 'Unauthorized access');
        }

        if (!Storage::exists($document->file_path)) {
            abort(404, 'File not found');
        }

        return Storage::download($document->file_path, $document->original_filename);
    }

    /**
     * Delete document
     */
    public function destroy(Document $document): JsonResponse
    {
        // Check access permissions
        if ($document->application->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        try {
            // Delete file from storage
            if (Storage::exists($document->file_path)) {
                Storage::delete($document->file_path);
            }

            // Delete database record
            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Batch process documents
     */
    public function batchProcess(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'document_ids' => 'required|array',
            'document_ids.*' => 'exists:documents,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $results = $this->documentService->batchProcessDocuments($request->document_ids);

            return response()->json([
                'success' => true,
                'results' => $results
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Batch processing failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get extraction results for multiple documents
     */
    public function batchStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'document_ids' => 'required|array',
            'document_ids.*' => 'exists:documents,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $status = $this->documentService->getProcessingStatus($request->document_ids);

            return response()->json([
                'success' => true,
                'status' => $status
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Status check failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if document type is mandatory for category
     */
    private function isMandatoryDocument(string $category, string $documentType): bool
    {
        $mandatoryDocs = [
            'corporate_registration' => ['CR6', 'CR11', 'CR14', 'ARTICLES'],
            'ownership_capital' => ['SHARE_REGISTER', 'NET_WORTH', 'CAPITAL_PROOF'],
            'governance_personnel' => ['BOARD_RESOLUTION', 'CVS', 'VETTING', 'ID_COPIES'],
            'financial_operational' => ['AUDITED_ACCOUNTS', 'PROJECTIONS', 'PROCEDURES']
        ];

        return in_array($documentType, $mandatoryDocs[$category] ?? []);
    }
}
