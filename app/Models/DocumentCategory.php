<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'required_documents',
        'ai_extraction_config',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'required_documents' => 'array',
        'ai_extraction_config' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function documents()
    {
        return $this->hasMany(Document::class, 'category', 'slug');
    }

    public function getMandatoryDocumentsAttribute(): array
    {
        return array_filter($this->required_documents, fn($doc) => $doc['mandatory'] ?? false);
    }

    public function getOptionalDocumentsAttribute(): array
    {
        return array_filter($this->required_documents, fn($doc) => !($doc['mandatory'] ?? false));
    }

    public function getTotalRequiredCount(): int
    {
        return count($this->mandatory_documents);
    }
}
