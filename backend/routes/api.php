<?php

use App\Http\Controllers\Api\Admin\AuditLogController;
use App\Http\Controllers\Api\Admin\ApiKeyController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\JobController as AdminJobController;
use App\Http\Controllers\Api\Admin\JobSourceController as AdminJobSourceController;
use App\Http\Controllers\Api\Admin\LocationController as AdminLocationController;
use App\Http\Controllers\Api\Admin\LandingPageContentController as AdminLandingPageContentController;
use App\Http\Controllers\Api\Admin\PageController as AdminPageController;
use App\Http\Controllers\Api\Admin\AdminScrapedJobController;
use App\Http\Controllers\Api\Admin\SettingsController;
use App\Http\Controllers\Api\Admin\ScrapeRunController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Public\CategoryController as PublicCategoryController;
use App\Http\Controllers\Api\Public\ContactMessageController;
use App\Http\Controllers\Api\Public\JobController as PublicJobController;
use App\Http\Controllers\Api\Public\LandingPageContentController as PublicLandingPageContentController;
use App\Http\Controllers\Api\Public\LocationController as PublicLocationController;
use App\Http\Controllers\Api\Public\PageController as PublicPageController;
use App\Http\Controllers\Api\Public\ScraperController as PublicScraperController;
use App\Http\Controllers\Api\ScrapedJobImportController;
use Illuminate\Support\Facades\Route;

Route::get('/healthz', static fn () => response()->json([
    'success' => true,
    'message' => 'ok',
]));

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth-login');
    Route::post('/user/register', [AuthController::class, 'registerUser'])->middleware('throttle:auth-login');
    Route::post('/user/login', [AuthController::class, 'loginUser'])->middleware('throttle:auth-login');
    Route::post('/admin/login', [AuthController::class, 'loginAdmin'])->middleware('throttle:auth-login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});

Route::get('/jobs', [PublicJobController::class, 'index']);
Route::get('/jobs/stats', [PublicJobController::class, 'stats']);
Route::get('/jobs/{identifier}', [PublicJobController::class, 'show']);
Route::get('/pages/{slug}', [PublicPageController::class, 'show']);
Route::post('/internal/scraped-jobs/import', ScrapedJobImportController::class)->middleware('internal.token');
Route::post('/scraper/run', [PublicScraperController::class, 'trigger'])->middleware('throttle:scrape-run');
Route::get('/scraper/logs', [PublicScraperController::class, 'logs'])->middleware('throttle:60,1');
Route::get('/categories', [PublicCategoryController::class, 'index']);
Route::get('/locations', [PublicLocationController::class, 'index']);
Route::get('/landing-page-content', [PublicLandingPageContentController::class, 'show']);
Route::post('/contact', [ContactMessageController::class, 'store'])->middleware('throttle:5,1');

Route::prefix('admin')
    ->middleware(['auth:sanctum'])
    ->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->middleware('permission:view dashboard');
        Route::get('/landing-page-content', [AdminLandingPageContentController::class, 'show'])->middleware('permission:manage site content');
        Route::put('/landing-page-content', [AdminLandingPageContentController::class, 'update'])->middleware('permission:manage site content');
        Route::post('/landing-page-content/publish', [AdminLandingPageContentController::class, 'publish'])->middleware('permission:manage site content');

        Route::apiResource('/jobs', AdminJobController::class)
            ->middlewareFor(['index', 'show'], 'permission:view jobs')
            ->middlewareFor('store', 'permission:create jobs')
            ->middlewareFor('update', 'permission:edit jobs')
            ->middlewareFor('destroy', 'permission:delete jobs');
        Route::patch('/jobs/{job}/publish', [AdminJobController::class, 'publish'])->middleware('permission:publish jobs');
        Route::patch('/jobs/{job}/unpublish', [AdminJobController::class, 'unpublish'])->middleware('permission:publish jobs');
        Route::patch('/jobs/{job}/reject', [AdminJobController::class, 'reject'])->middleware('permission:reject jobs');
        Route::patch('/jobs/{job}/mark-duplicate', [AdminJobController::class, 'markDuplicate'])->middleware('permission:edit jobs');
        Route::patch('/jobs/{job}/restore-draft', [AdminJobController::class, 'restoreDraft'])->middleware('permission:edit jobs');

        Route::apiResource('/categories', AdminCategoryController::class)->middleware('permission:manage categories');
        Route::apiResource('/job-sources', AdminJobSourceController::class)->middleware('permission:manage sources');
        Route::apiResource('/locations', AdminLocationController::class)->middleware('permission:manage categories');
        Route::apiResource('/pages', AdminPageController::class)->middleware('permission:manage site content');
        Route::patch('/pages/{page}/publish', [AdminPageController::class, 'publish'])->middleware('permission:manage site content');

        Route::get('/scrape-runs', [ScrapeRunController::class, 'index'])->middleware('permission:view scrape logs');
        Route::post('/scrape-runs/run', [ScrapeRunController::class, 'run'])
            ->middleware(['permission:run scraping', 'throttle:scrape-run']);
        Route::get('/scrape-runs/{id}', [ScrapeRunController::class, 'show'])->middleware('permission:view scrape logs');
        Route::get('/scrape-runs/{id}/logs', [ScrapeRunController::class, 'logs'])->middleware('permission:view scrape logs');

        // Settings
        Route::get('/settings', [SettingsController::class, 'index'])->middleware('permission:manage settings');
        Route::put('/settings', [SettingsController::class, 'update'])->middleware('permission:manage settings');

        // Users
        Route::get('/users', [UserManagementController::class, 'index'])->middleware('permission:manage users');
        Route::post('/users', [UserManagementController::class, 'store'])->middleware('permission:manage users');
        Route::put('/users/{id}', [UserManagementController::class, 'update'])->middleware('permission:manage users');
        Route::delete('/users/{id}', [UserManagementController::class, 'destroy'])->middleware('permission:manage users');

        // API Keys
        Route::get('/api-keys', [ApiKeyController::class, 'index'])->middleware('permission:manage settings');
        Route::post('/api-keys', [ApiKeyController::class, 'store'])->middleware('permission:manage settings');
        Route::put('/api-keys/{id}', [ApiKeyController::class, 'update'])->middleware('permission:manage settings');
        Route::delete('/api-keys/{id}', [ApiKeyController::class, 'destroy'])->middleware('permission:manage settings');

        // Audit Logs
        Route::get('/audit-logs', [AuditLogController::class, 'index'])->middleware('permission:view audit logs');

        Route::get('/scraped-jobs', [AdminScrapedJobController::class, 'index'])->middleware('permission:view jobs');
        Route::post('/scraped-jobs/bulk-clean-ai', [AdminScrapedJobController::class, 'bulkCleanAi'])->middleware('permission:edit jobs');
        Route::get('/scraped-jobs/bulk-clean-ai/{batchId}/status', [AdminScrapedJobController::class, 'bulkCleanAiStatus'])->middleware('permission:view jobs');
        Route::post('/scraped-jobs/bulk-approve', [AdminScrapedJobController::class, 'bulkApprove'])->middleware('permission:edit jobs');
        Route::post('/scraped-jobs/bulk-reject', [AdminScrapedJobController::class, 'bulkReject'])->middleware('permission:edit jobs');
        Route::post('/scraped-jobs/bulk-publish', [AdminScrapedJobController::class, 'bulkPublish'])->middleware('permission:publish jobs');
        Route::get('/scraped-jobs/{scrapedJob}', [AdminScrapedJobController::class, 'show'])->middleware('permission:view jobs');
        Route::patch('/scraped-jobs/{scrapedJob}', [AdminScrapedJobController::class, 'update'])->middleware('permission:edit jobs');
        Route::patch('/scraped-jobs/{scrapedJob}/approve', [AdminScrapedJobController::class, 'approve'])->middleware('permission:edit jobs');
        Route::patch('/scraped-jobs/{scrapedJob}/reject', [AdminScrapedJobController::class, 'reject'])->middleware('permission:edit jobs');
        Route::post('/scraped-jobs/{scrapedJob}/publish', [AdminScrapedJobController::class, 'publish'])->middleware('permission:publish jobs');
        Route::post('/scraped-jobs/{scrapedJob}/clean-ai', [AdminScrapedJobController::class, 'cleanAi'])->middleware('permission:edit jobs');
    });
