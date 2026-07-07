<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiKey;
use App\Models\AuditLog;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiKeyController extends Controller
{
    public function index()
    {
        $keys = ApiKey::with('creator:id,name')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (ApiKey $k) => $this->formatKey($k));

        return ApiResponse::success($keys, 'API keys retrieved');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        ['model' => $model, 'plain' => $plain] = ApiKey::generate(
            $data['name'],
            Auth::id(),
            $data['description'] ?? null,
        );

        AuditLog::record('api_key.create', 'ApiKey', $model->id, [], ['name' => $model->name, 'prefix' => $model->prefix]);

        return ApiResponse::success(
            array_merge($this->formatKey($model), ['plain_key' => $plain]),
            'API key created — copy the key now, it will not be shown again',
            201
        );
    }

    public function update(Request $request, int $id)
    {
        $key = ApiKey::findOrFail($id);
        $data = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string|max:500',
            'is_active'   => 'sometimes|boolean',
        ]);

        $before = ['name' => $key->name, 'is_active' => $key->is_active];
        $key->update($data);
        AuditLog::record('api_key.update', 'ApiKey', $key->id, $before, $data);

        return ApiResponse::success($this->formatKey($key->fresh()), 'API key updated');
    }

    public function destroy(int $id)
    {
        $key = ApiKey::findOrFail($id);
        AuditLog::record('api_key.revoke', 'ApiKey', $key->id, ['name' => $key->name, 'prefix' => $key->prefix], []);
        $key->delete();

        return ApiResponse::success(null, 'API key revoked');
    }

    private function formatKey(ApiKey $key): array
    {
        return [
            'id'          => $key->id,
            'name'        => $key->name,
            'prefix'      => $key->prefix,
            'description' => $key->description,
            'is_active'   => $key->is_active,
            'last_used_at'=> $key->last_used_at?->toISOString(),
            'expires_at'  => $key->expires_at?->toISOString(),
            'created_by'  => $key->creator?->name,
            'created_at'  => $key->created_at?->toISOString(),
        ];
    }
}
