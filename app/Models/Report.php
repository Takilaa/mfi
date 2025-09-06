<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id',
        'generated_by',
        'type',
        'docx_path',
        'pdf_path',
        'generation_options',
        'status',
        'error_message',
        'generated_at',
    ];

    protected $casts = [
        'generation_options' => 'array',
        'generated_at' => 'datetime',
    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function hasFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isGenerating(): bool
    {
        return $this->status === 'generating';
    }
}
