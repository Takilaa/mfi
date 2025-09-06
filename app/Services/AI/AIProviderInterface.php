<?php

namespace App\Services\AI;

interface AIProviderInterface
{
    /**
     * Extract structured data from document
     */
    public function extractData(string $filePath, string $category): array;

    /**
     * Get provider name
     */
    public function getProviderName(): string;

    /**
     * Check if provider is configured
     */
    public function isConfigured(): bool;
}
