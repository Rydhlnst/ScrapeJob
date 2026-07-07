<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::with('roles')
            ->orderBy('created_at')
            ->get()
            ->map(fn (User $u) => $this->formatUser($u));

        $roles = Role::orderBy('name')->pluck('name');

        return ApiResponse::success(['users' => $users, 'roles' => $roles], 'Users retrieved');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role'     => 'required|string|exists:roles,name',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        $user->assignRole($data['role']);

        AuditLog::record('user.create', 'User', $user->id, [], ['name' => $user->name, 'email' => $user->email, 'role' => $data['role']]);

        return ApiResponse::success($this->formatUser($user->fresh(['roles'])), 'User created', 201);
    }

    public function update(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'role'     => 'sometimes|string|exists:roles,name',
            'password' => 'sometimes|nullable|string|min:8',
        ]);

        $before = ['name' => $user->name, 'role' => $user->roles->first()?->name];

        if (isset($data['name'])) $user->name = $data['name'];
        if (isset($data['password']) && $data['password']) $user->password = Hash::make($data['password']);
        $user->save();

        if (isset($data['role'])) $user->syncRoles([$data['role']]);

        AuditLog::record('user.update', 'User', $user->id, $before, ['name' => $user->name, 'role' => $data['role'] ?? $before['role']]);

        return ApiResponse::success($this->formatUser($user->fresh(['roles'])), 'User updated');
    }

    public function destroy(int $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            return ApiResponse::error('Cannot delete your own account', 422);
        }

        AuditLog::record('user.delete', 'User', $user->id, ['name' => $user->name, 'email' => $user->email], []);
        $user->delete();

        return ApiResponse::success(null, 'User deleted');
    }

    private function formatUser(User $user): array
    {
        return [
            'id'         => $user->id,
            'name'       => $user->name,
            'email'      => $user->email,
            'role'       => $user->roles->first()?->name,
            'created_at' => $user->created_at?->toISOString(),
        ];
    }
}
