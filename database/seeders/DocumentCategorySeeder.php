<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DocumentCategory;

class DocumentCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Corporate Documents',
                'slug' => 'corporate-documents',
                'description' => 'Company registration, certificates, and corporate structure documents',
                'required_documents' => json_encode([
                    'Company Registration Certificate',
                    'Memorandum and Articles of Association',
                    'Tax Clearance Certificate',
                    'Directors\' Identification Documents'
                ]),
                'ai_extraction_config' => json_encode([
                    'company_name' => true,
                    'registration_number' => true,
                    'tax_number' => true,
                    'directors' => true
                ]),
                'sort_order' => 1,
                'is_active' => true
            ],
            [
                'name' => 'Ownership Structure',
                'slug' => 'ownership-structure',
                'description' => 'Share certificates, shareholder agreements, and ownership documentation',
                'required_documents' => json_encode([
                    'Share Certificates',
                    'Shareholder Register',
                    'Shareholder Agreements',
                    'Beneficial Ownership Declaration'
                ]),
                'ai_extraction_config' => json_encode([
                    'shareholder_names' => true,
                    'share_percentages' => true,
                    'total_shares' => true,
                    'beneficial_owners' => true
                ]),
                'sort_order' => 2,
                'is_active' => true
            ],
            [
                'name' => 'Governance & Compliance',
                'slug' => 'governance-compliance',
                'description' => 'Board resolutions, compliance certificates, and regulatory documents',
                'required_documents' => json_encode([
                    'Board Resolution for MFI License',
                    'Compliance Certificate',
                    'Risk Management Policy',
                    'Anti-Money Laundering Policy'
                ]),
                'ai_extraction_config' => json_encode([
                    'board_members' => true,
                    'compliance_status' => true,
                    'policy_dates' => true,
                    'regulatory_requirements' => true
                ]),
                'sort_order' => 3,
                'is_active' => true
            ],
            [
                'name' => 'Financial Documents',
                'slug' => 'financial-documents',
                'description' => 'Financial statements, projections, and banking documentation',
                'required_documents' => json_encode([
                    'Audited Financial Statements (3 years)',
                    'Financial Projections (3 years)',
                    'Bank Statements (6 months)',
                    'Capital Adequacy Statement'
                ]),
                'ai_extraction_config' => json_encode([
                    'total_assets' => true,
                    'total_liabilities' => true,
                    'net_worth' => true,
                    'capital_adequacy_ratio' => true
                ]),
                'sort_order' => 4,
                'is_active' => true
            ]
        ];

        foreach ($categories as $category) {
            DocumentCategory::firstOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
}
