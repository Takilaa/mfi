<?php

namespace App\Services;

use App\Models\Application;
use PhpOffice\PhpWord\TemplateProcessor;
use PhpOffice\PhpWord\IOFactory;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Exception;

class ReportGenerationService
{
    private string $templatePath;
    
    public function __construct()
    {
        $this->templatePath = storage_path('app/templates/evaluation_report_template.docx');
    }

    /**
     * Generate evaluation report for an application
     */
    public function generateEvaluationReport(Application $application, array $options = []): array
    {
        try {
            // 1. Validate template exists
            if (!file_exists($this->templatePath)) {
                throw new Exception("Report template not found: {$this->templatePath}");
            }

            // 2. Load template
            $templateProcessor = new TemplateProcessor($this->templatePath);

            // 3. Populate basic company information
            $this->populateCompanyDetails($templateProcessor, $application);

            // 4. Populate shareholding structure
            $this->populateShareholdingTable($templateProcessor, $application);

            // 5. Populate governance structure
            $this->populateGovernanceTable($templateProcessor, $application);

            // 6. Populate financial information
            $this->populateFinancialTables($templateProcessor, $application);

            // 7. Populate evaluation narratives
            $this->populateEvaluationNarratives($templateProcessor, $application);

            // 8. Populate signature placeholders
            $this->populateSignaturePlaceholders($templateProcessor, $options);

            // 9. Save generated report
            $outputPath = $this->generateOutputPath($application);
            $templateProcessor->saveAs($outputPath);

            // 10. Convert to PDF if requested
            $pdfPath = null;
            if ($options['generate_pdf'] ?? false) {
                $pdfPath = $this->convertToPdf($outputPath);
            }

            Log::info("Evaluation report generated successfully", [
                'application_id' => $application->id,
                'docx_path' => $outputPath,
                'pdf_path' => $pdfPath
            ]);

            return [
                'success' => true,
                'docx_path' => $outputPath,
                'pdf_path' => $pdfPath,
                'download_url' => Storage::url(basename($outputPath))
            ];

        } catch (Exception $e) {
            Log::error("Report generation failed: {$e->getMessage()}", [
                'application_id' => $application->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Populate basic company details
     */
    private function populateCompanyDetails(TemplateProcessor $template, Application $application): void
    {
        $formData = $application->form_data ?? [];

        $template->setValue('company_name', $formData['company_name'] ?? 'N/A');
        $template->setValue('registration_number', $formData['registration_number'] ?? 'N/A');
        $template->setValue('incorporation_date', $formData['incorporation_date'] ?? 'N/A');
        $template->setValue('registered_address', $formData['registered_address'] ?? 'N/A');
        $template->setValue('application_date', $application->created_at->format('d/m/Y'));
        $template->setValue('evaluation_date', now()->format('d/m/Y'));
        $template->setValue('authorized_capital', number_format($formData['authorized_capital'] ?? 0, 2));
        $template->setValue('issued_capital', number_format($formData['issued_capital'] ?? 0, 2));
    }

    /**
     * Populate shareholding structure table
     */
    private function populateShareholdingTable(TemplateProcessor $template, Application $application): void
    {
        $formData = $application->form_data ?? [];
        $shareholders = $formData['shareholders'] ?? [];

        if (empty($shareholders)) {
            $template->setValue('shareholding_table', 'No shareholding information available');
            return;
        }

        // Clone table row for each shareholder
        $template->cloneRow('shareholder_name', count($shareholders));

        foreach ($shareholders as $index => $shareholder) {
            $rowIndex = $index + 1;
            
            $template->setValue("shareholder_name#{$rowIndex}", $shareholder['name'] ?? 'N/A');
            $template->setValue("shares_held#{$rowIndex}", number_format($shareholder['shares'] ?? 0));
            $template->setValue("percentage#{$rowIndex}", number_format($shareholder['percentage'] ?? 0, 2) . '%');
            $template->setValue("contribution#{$rowIndex}", '$' . number_format($shareholder['contribution'] ?? 0, 2));
            $template->setValue("net_worth#{$rowIndex}", '$' . number_format($shareholder['net_worth'] ?? 0, 2));
        }
    }

    /**
     * Populate governance structure table
     */
    private function populateGovernanceTable(TemplateProcessor $template, Application $application): void
    {
        $formData = $application->form_data ?? [];
        $boardMembers = $formData['board_members'] ?? [];

        if (empty($boardMembers)) {
            $template->setValue('governance_table', 'No governance information available');
            return;
        }

        $template->cloneRow('member_name', count($boardMembers));

        foreach ($boardMembers as $index => $member) {
            $rowIndex = $index + 1;
            
            $template->setValue("member_name#{$rowIndex}", $member['name'] ?? 'N/A');
            $template->setValue("position#{$rowIndex}", $member['position'] ?? 'N/A');
            $template->setValue("qualifications#{$rowIndex}", $member['qualifications'] ?? 'N/A');
            $template->setValue("experience#{$rowIndex}", $member['experience'] ?? 'N/A');
            $template->setValue("vetting_status#{$rowIndex}", $member['vetting_status'] ?? 'Pending');
        }
    }

    /**
     * Populate financial tables
     */
    private function populateFinancialTables(TemplateProcessor $template, Application $application): void
    {
        $formData = $application->form_data ?? [];
        
        // Financial projections
        $projections = $formData['financial_projections'] ?? [];
        if (!empty($projections)) {
            $template->setValue('year_1_revenue', '$' . number_format($projections['year_1_revenue'] ?? 0, 2));
            $template->setValue('year_1_expenses', '$' . number_format($projections['year_1_expenses'] ?? 0, 2));
            $template->setValue('year_1_profit', '$' . number_format($projections['year_1_profit'] ?? 0, 2));
            
            $template->setValue('year_2_revenue', '$' . number_format($projections['year_2_revenue'] ?? 0, 2));
            $template->setValue('year_2_expenses', '$' . number_format($projections['year_2_expenses'] ?? 0, 2));
            $template->setValue('year_2_profit', '$' . number_format($projections['year_2_profit'] ?? 0, 2));
            
            $template->setValue('year_3_revenue', '$' . number_format($projections['year_3_revenue'] ?? 0, 2));
            $template->setValue('year_3_expenses', '$' . number_format($projections['year_3_expenses'] ?? 0, 2));
            $template->setValue('year_3_profit', '$' . number_format($projections['year_3_profit'] ?? 0, 2));
        }

        // Capital adequacy
        $template->setValue('minimum_capital', '$' . number_format($formData['minimum_capital'] ?? 0, 2));
        $template->setValue('paid_up_capital', '$' . number_format($formData['paid_up_capital'] ?? 0, 2));
        $template->setValue('capital_adequacy_ratio', number_format($formData['capital_adequacy_ratio'] ?? 0, 2) . '%');
    }

    /**
     * Populate evaluation narratives
     */
    private function populateEvaluationNarratives(TemplateProcessor $template, Application $application): void
    {
        $evaluation = $application->evaluation ?? [];

        // Background narrative
        $background = $evaluation['background'] ?? $this->generateDefaultBackground($application);
        $template->setValue('background_narrative', $background);

        // Compliance assessment
        $compliance = $evaluation['compliance'] ?? $this->generateDefaultCompliance($application);
        $template->setValue('compliance_assessment', $compliance);

        // Viability assessment
        $viability = $evaluation['viability'] ?? $this->generateDefaultViability($application);
        $template->setValue('viability_assessment', $viability);

        // Recommendations
        $recommendations = $evaluation['recommendations'] ?? $this->generateDefaultRecommendations($application);
        $template->setValue('recommendations', $recommendations);

        // Overall assessment
        $overallAssessment = $evaluation['overall_assessment'] ?? 'Pending detailed review';
        $template->setValue('overall_assessment', $overallAssessment);
    }

    /**
     * Populate signature placeholders
     */
    private function populateSignaturePlaceholders(TemplateProcessor $template, array $options): void
    {
        $template->setValue('prepared_by', $options['prepared_by'] ?? '[Prepared By]');
        $template->setValue('prepared_date', $options['prepared_date'] ?? now()->format('d/m/Y'));
        
        $template->setValue('reviewed_by', $options['reviewed_by'] ?? '[Reviewed By]');
        $template->setValue('reviewed_date', $options['reviewed_date'] ?? '[Review Date]');
        
        $template->setValue('approved_by', $options['approved_by'] ?? '[Approved By]');
        $template->setValue('approved_date', $options['approved_date'] ?? '[Approval Date]');
    }

    /**
     * Generate output file path
     */
    private function generateOutputPath(Application $application): string
    {
        $filename = "evaluation_report_{$application->id}_" . now()->format('Y-m-d_H-i-s') . '.docx';
        return storage_path("app/reports/{$filename}");
    }

    /**
     * Convert DOCX to PDF
     */
    private function convertToPdf(string $docxPath): string
    {
        $pdfPath = str_replace('.docx', '.pdf', $docxPath);
        
        // Use DomPDF or other PDF converter
        // This is a placeholder - implement based on your PDF conversion preference
        
        return $pdfPath;
    }

    /**
     * Generate default background narrative
     */
    private function generateDefaultBackground(Application $application): string
    {
        $formData = $application->form_data ?? [];
        $companyName = $formData['company_name'] ?? 'the applicant company';
        
        return "{$companyName} has submitted an application for microfinance institution licensing. " .
               "The application was received on {$application->created_at->format('d/m/Y')} and includes " .
               "all required documentation as per RBZ requirements.";
    }

    /**
     * Generate default compliance assessment
     */
    private function generateDefaultCompliance(Application $application): string
    {
        return "The application has been reviewed for compliance with regulatory requirements. " .
               "All mandatory documents have been submitted and are currently under detailed review.";
    }

    /**
     * Generate default viability assessment
     */
    private function generateDefaultViability(Application $application): string
    {
        return "The financial projections and business model have been assessed for viability. " .
               "Further analysis is required to determine long-term sustainability.";
    }

    /**
     * Generate default recommendations
     */
    private function generateDefaultRecommendations(Application $application): string
    {
        return "Based on the preliminary review, the following recommendations are made: " .
               "1. Complete detailed financial analysis\n" .
               "2. Verify all submitted documentation\n" .
               "3. Conduct management interviews";
    }
}
