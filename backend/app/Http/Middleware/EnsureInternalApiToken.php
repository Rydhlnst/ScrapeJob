<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureInternalApiToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $expectedToken = (string) config('services.scraper.internal_token', '');
        if ($expectedToken === '') {
            return ApiResponse::error('Internal API token is not configured.', 500);
        }

        $providedToken = (string) $request->bearerToken();
        if (! hash_equals($expectedToken, $providedToken)) {
            return ApiResponse::error('Unauthorized internal request.', 401);
        }

        return $next($request);
    }
}
