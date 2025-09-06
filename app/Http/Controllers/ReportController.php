<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Report;
use App\Services\ReportGenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    private ReportGenerationService $reportService;

    public function __construct(ReportGenerationService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Generate evaluation report for application
     */
    public function generateEvaluation(Request $request, Application $application): JsonResponse
    {
        // Only registrars can generate reports
        if (!auth()->user()->isRegistrar() && !auth()->user()->isSuperUser()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only registrars can generate reports.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'generate_pdf' => 'boolean',
            'prepared_by' => 'string|max:255',
            'reviewed_by' => 'string|max:255',
            'approved_by' => 'string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create report record
            $report = Report::create([
                'application_id' => $application->id,
                'generated_by' => auth()->id(),
                'type' => 'evaluation',
                'generation_options' => $request->all(),
                'status' => 'generating'
            ]);

            // Generate report asynchronously
            dispatch(function () use ($report, $application, $request) {
                try {
                    $result = $this->reportService->generateEvaluationReport(
                        $application, 
                        $request->all()
                    );

                    if ($result['success']) {
                        $report->update([
                            'status' => 'completed',
                            'docx_path' => $result['docx_path'],
                            'pdf_path' => $result['pdf_path'] ?? null,
                            'generated_at' => now()
                        ]);
                    } else {
                        $report->update([
                            'status' => 'failed',
                            'error_message' => $result['error']
                        ]);
                    }
                } catch (\Exception $e) {
                    $report->update([
                        'status' => 'failed',
                        'error_message' => $e->getMessage()
                    ]);
                }
            })->afterResponse();

            return response()->json([
                'success' => true,
                'report_id' => $report->id,
                'message' => 'Report generation started. You will be notified when complete.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Report generation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get report status
     */
    public function status(Report $report): JsonResponse
    {
        return response()->json([
            'report_id' => $report->id,
            'status' => $report->status,
            'type' => $report->type,
            'generated_at' => $report->generated_at,
            'error_message' => $report->error_message,
            'download_urls' => [
                'docx' => $report->docx_path ? route('reports.download', ['report' => $report->id, 'format' => 'docx']) : null,
                'pdf' => $report->pdf_path ? route('reports.download', ['report' => $report->id, 'format' => 'pdf']) : null
            ]
        ]);
    }

    /**
     * Download report
     */
    public function download(Report $report, string $format = 'docx')
    {
        $filePath = $format === 'pdf' ? $report->pdf_path : $report->docx_path;
        
        if (!$filePath || !file_exists($filePath)) {
            abort(404, 'Report file not found');
        }

        $filename = "evaluation_report_{$report->application->application_number}.{$format}";
        
        return response()->download($filePath, $filename);
    }

    /**
     * List reports for application
     */
    public function index(Application $application): JsonResponse
    {
        $reports = $application->reports()
            ->with('generatedBy:id,name')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'reports' => $reports
        ]);
    }

    /**
     * Delete report
     */
    public function destroy(Report $report): JsonResponse
    {
        try {
            // Delete files
            if ($report->docx_path && file_exists($report->docx_path)) {
                unlink($report->docx_path);
            }
            if ($report->pdf_path && file_exists($report->pdf_path)) {
                unlink($report->pdf_path);
            }

            // Delete record
            $report->delete();

            return response()->json([
                'success' => true,
                'message' => 'Report deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Delete failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
