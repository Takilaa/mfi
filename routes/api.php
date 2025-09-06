<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Authentication
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    
    // Applications
    Route::prefix('applications')->group(function () {
        Route::get('/', [ApplicationController::class, 'index']);
        Route::post('/', [ApplicationController::class, 'store']);
        Route::get('/my', [ApplicationController::class, 'myApplications']);
        Route::get('/statistics', [ApplicationController::class, 'statistics']);
        Route::get('/{application}', [ApplicationController::class, 'show']);
        Route::put('/{application}', [ApplicationController::class, 'update']);
        Route::post('/{application}/submit', [ApplicationController::class, 'submit']);
        Route::put('/{application}/status', [ApplicationController::class, 'updateStatus']);
        
        // Application documents
        Route::get('/{application}/documents', [DocumentController::class, 'index']);
    });
    
    // Documents
    Route::prefix('documents')->group(function () {
        Route::post('/upload', [DocumentController::class, 'upload']);
        Route::post('/batch-process', [DocumentController::class, 'batchProcess']);
        Route::post('/batch-status', [DocumentController::class, 'batchStatus']);
        Route::get('/{document}/status', [DocumentController::class, 'status']);
        Route::get('/{document}/download', [DocumentController::class, 'download']);
        Route::delete('/{document}', [DocumentController::class, 'destroy']);
    });
    
    // Reports
    Route::prefix('reports')->group(function () {
        Route::get('/applications/{application}', [ReportController::class, 'index']);
        Route::post('/applications/{application}/evaluation', [ReportController::class, 'generateEvaluation']);
        Route::get('/{report}/status', [ReportController::class, 'status']);
        Route::get('/{report}/download/{format?}', [ReportController::class, 'download'])->name('reports.download');
        Route::delete('/{report}', [ReportController::class, 'destroy']);
    });
    
    // Users (Super User only)
    Route::middleware('role:super_user')->prefix('users')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store']);
        Route::get('/{user}', [UserController::class, 'show']);
        Route::put('/{user}', [UserController::class, 'update']);
        Route::delete('/{user}', [UserController::class, 'destroy']);
        Route::put('/{user}/activate', [UserController::class, 'activate']);
        Route::put('/{user}/deactivate', [UserController::class, 'deactivate']);
    });
    
    // Registrars list (for assignment)
    Route::get('/registrars', [UserController::class, 'registrars']);
});
