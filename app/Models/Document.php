<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'category',
        'document_type',
        'original_filename',
        'file_path',
        'mime_type',
        'file_size',
        'extraction_status',
        'extracted_data',
        'mapped_data',
        'error_message',
        'processed_at',
        'is_mandatory',
        'description',
    ];

    protected $casts = [
        'extracted_data' => 'array',
        'mapped_data' => 'array',
        'processed_at' => 'datetime',
        'is_mandatory' => 'boolean',
        'file_size' => 'integer',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function category()
    {
        return $this->belongsTo(DocumentCategory::class, 'category', 'slug');
    }

    public function getFileSizeHumanAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function isProcessed(): bool
    {
        return $this->extraction_status === 'completed';
    }

    public function hasFailed(): bool
    {
        return $this->extraction_status === 'failed';
    }

    public function isProcessing(): bool
    {
        return $this->extraction_status === 'processing';
    }

    public function isPending(): bool
    {
        return $this->extraction_status === 'pending';
    }
}
