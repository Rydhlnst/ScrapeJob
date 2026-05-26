<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $user = \App\Models\User::query()->where('email', $request->string('email'))->first();

        if (! $user || ! Hash::check($request->string('password'), $user->password)) {
            return ApiResponse::error('Invalid credentials.', 401);
        }

        $token = $user->createToken('nextjs-admin-token')->plainTextToken;

        return ApiResponse::success([
            'accessToken' => $token,
            'tokenType' => 'Bearer',
            'user' => new UserResource($user),
        ], 'Login successful');
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
}
