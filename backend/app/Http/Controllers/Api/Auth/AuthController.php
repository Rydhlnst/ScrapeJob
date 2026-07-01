<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        // Keep backward compatibility with existing clients.
        return $this->loginAdmin($request);
    }

    public function loginAdmin(LoginRequest $request)
    {
        $user = User::query()->where('email', $request->string('email'))->first();

        if (! $user || ! Hash::check($request->string('password'), $user->password)) {
            return ApiResponse::error('Invalid credentials.', 401);
        }

        try {
            if (! $this->isAdminUser($user)) {
                return ApiResponse::error('This account is not allowed to access admin.', 403);
            }

            return $this->tokenResponse($user, 'nextjs-admin-token', 'Admin login successful');
        } catch (\Throwable $exception) {
            Log::error('Admin login failed due to auth backend readiness issue.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $exception->getMessage(),
            ]);

            return ApiResponse::error('Authentication backend is not ready. Check Sanctum and permission migrations.', 503);
        }
    }

    public function loginUser(LoginRequest $request)
    {
        $user = User::query()->where('email', $request->string('email'))->first();

        if (! $user || ! Hash::check($request->string('password'), $user->password)) {
            return ApiResponse::error('Invalid credentials.', 401);
        }

        try {
            if ($this->isAdminUser($user)) {
                return ApiResponse::error('Use admin login endpoint for this account.', 403);
            }

            return $this->tokenResponse($user, 'nextjs-user-token', 'User login successful');
        } catch (\Throwable $exception) {
            Log::error('User login failed due to auth backend readiness issue.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $exception->getMessage(),
            ]);

            return ApiResponse::error('Authentication backend is not ready. Check Sanctum and permission migrations.', 503);
        }
    }

    public function registerAdmin(RegisterRequest $request)
    {
        $user = User::query()->create([
            'name' => (string) $request->string('name'),
            'email' => (string) $request->string('email'),
            'password' => (string) $request->string('password'),
        ]);
        $user->assignRole('admin');

        return $this->tokenResponse($user, 'nextjs-admin-token', 'Admin register successful', 201);
    }

    public function registerUser(RegisterRequest $request)
    {
        $user = User::query()->create([
            'name' => (string) $request->string('name'),
            'email' => (string) $request->string('email'),
            'password' => (string) $request->string('password'),
        ]);

        return $this->tokenResponse($user, 'nextjs-user-token', 'User register successful', 201);
    }

    public function me(Request $request)
    {
        return ApiResponse::success(new UserResource($request->user()), 'Current user retrieved successfully');
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return ApiResponse::success(null, 'Logout successful');
    }

    private function isAdminUser(User $user): bool
    {
        return $user->hasAnyRole(['super_admin', 'admin', 'editor']);
    }

    private function tokenResponse(User $user, string $tokenName, string $message, int $status = 200)
    {
        $token = $user->createToken($tokenName)->plainTextToken;

        return ApiResponse::success([
            'accessToken' => $token,
            'tokenType' => 'Bearer',
            'user' => new UserResource($user),
        ], $message, $status);
    }
}
