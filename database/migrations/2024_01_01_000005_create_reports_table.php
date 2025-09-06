<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->onDelete('cascade');
            $table->foreignId('generated_by')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['evaluation', 'compliance', 'financial_analysis'])->default('evaluation');
            $table->string('docx_path')->nullable();
            $table->string('pdf_path')->nullable();
            $table->json('generation_options')->nullable();
            $table->enum('status', ['generating', 'completed', 'failed'])->default('generating');
            $table->text('error_message')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
