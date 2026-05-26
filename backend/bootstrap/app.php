<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use App\Jobs\ScrapeJobsJob;
use App\Jobs\SendJobNotificationJob;
use App\Http\Middleware\EnsureInternalApiToken;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(function ($request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return null;
            }

            return '/admin/login';
        });

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'internal.token' => EnsureInternalApiToken::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->job(new ScrapeJobsJob('jobstreet'))
            ->everySixHours()
            ->timezone('Asia/Jakarta')
            ->name('scrape-jobstreet-6h')
            ->withoutOverlapping(60);

        $schedule->job(new ScrapeJobsJob('glints'))
            ->everySixHours()
            ->timezone('Asia/Jakarta')
            ->name('scrape-glints-6h')
            ->withoutOverlapping(60);

        $schedule->job(new ScrapeJobsJob('kalibrr'))
            ->cron('0 */12 * * *')
            ->timezone('Asia/Jakarta')
            ->name('scrape-kalibrr-12h')
            ->withoutOverlapping(60);

        $schedule->job(new SendJobNotificationJob())
            ->dailyAt('07:30')
            ->timezone('Asia/Jakarta')
            ->name('notify-jobs-morning')
            ->withoutOverlapping();

        $schedule->job(new SendJobNotificationJob())
            ->dailyAt('18:30')
            ->timezone('Asia/Jakarta')
            ->name('notify-jobs-evening')
            ->withoutOverlapping();

        $schedule->call(function (): void {
            \App\Models\Job::query()
                ->whereNotNull('expires_at')
                ->where('expires_at', '<', now())
                ->where('is_active', true)
                ->update(['is_active' => false]);
        })
            ->dailyAt('00:00')
            ->timezone('Asia/Jakarta')
            ->name('deactivate-expired-jobs');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ValidationException $exception, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $exception->errors(),
                ], 422);
            }
        });

        $exceptions->render(function (AuthenticationException $exception, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated.',
                ], 401);
            }
        });

        $exceptions->render(function (AuthorizationException $exception, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to perform this action.',
                ], 403);
            }
        });

        $exceptions->render(function (ModelNotFoundException $exception, $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found.',
                ], 404);
            }
        });

        $exceptions->render(function (HttpExceptionInterface $exception, $request) {
            if (($request->expectsJson() || $request->is('api/*')) && $exception->getStatusCode() === 404) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found.',
                ], 404);
            }
        });
    })->create();
