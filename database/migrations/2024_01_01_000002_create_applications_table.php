<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('application_number')->unique();
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected'])->default('draft');
            $table->json('form_data')->nullable();
            $table->json('evaluation')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('auto_filled_at')->nullable();
            $table->foreignId('assigned_registrar_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('notes')->nullable();
            $table->decimal('progress_percentage', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
