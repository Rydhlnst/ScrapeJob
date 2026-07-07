<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->query('perPage', 25), 1), 100);

        $rows = AuditLog::with('user:id,name,email')
            ->when($request->filled('action'), fn ($q) => $q->where('action', 'like', $request->string('action') . '%'))
            ->when($request->filled('user_id'), fn ($q) => $q->where('user_id', $request->integer('user_id')))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('created_at', '>=', $request->string('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('created_at', '<=', $request->string('to')))
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        $data = collect($rows->items())->map(fn (AuditLog $log) => [
            'id'         => $log->id,
            'action'     => $log->action,
            'model_type' => $log->model_type,
            'model_id'   => $log->model_id,
            'before'     => $log->before,
            'after'      => $log->after,
            'ip_address' => $log->ip_address,
            'user'       => $log->user ? ['id' => $log->user->id, 'name' => $log->user->name, 'email' => $log->user->email] : null,
            'created_at' => $log->created_at?->toISOString(),
        ]);

        return ApiResponse::paginated($rows, $data, 'Audit logs retrieved');
    }
}
