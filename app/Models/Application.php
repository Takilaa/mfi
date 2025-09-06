<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'application_number',
        'status',
        'form_data',
        'evaluation',
        'submitted_at',
        'auto_filled_at',
        'assigned_registrar_id',
        'notes',
        'progress_percentage',
    ];

    protected $casts = [
        'form_data' => 'array',
        'evaluation' => 'array',
        'submitted_at' => 'datetime',
        'auto_filled_at' => 'datetime',
        'progress_percentage' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedRegistrar()
    {
        return $this->belongsTo(User::class, 'assigned_registrar_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function getCompanyNameAttribute(): ?string
    {
        return $this->form_data['company_name'] ?? null;
    }

    public function getRegistrationNumberAttribute(): ?string
    {
        return $this->form_data['registration_number'] ?? null;
    }

    public function getMandatoryDocuments()
    {
        return $this->documents()->where('is_mandatory', true);
    }

    public function getUploadedDocumentsCount(): int
    {
        return $this->documents()->count();
    }

    public function getProcessedDocumentsCount(): int
    {
        return $this->documents()->where('extraction_status', 'completed')->count();
    }

    public function calculateProgress(): float
    {
        $totalRequired = DocumentCategory::sum('required_documents');
        $uploaded = $this->getUploadedDocumentsCount();
        
        return $totalRequired > 0 ? ($uploaded / $totalRequired) * 100 : 0;
    }

    public function canBeSubmitted(): bool
    {
        $mandatoryDocs = $this->getMandatoryDocuments()->count();
        $requiredCount = DocumentCategory::where('is_active', true)
            ->get()
            ->sum(function ($category) {
                return count(array_filter($category->required_documents, fn($doc) => $doc['mandatory'] ?? false));
            });

        return $mandatoryDocs >= $requiredCount;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($application) {
            $application->application_number = 'MFI-' . date('Y') . '-' . str_pad(
                static::whereYear('created_at', date('Y'))->count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );
        });
    }
}
