<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WebsiteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'domain' => $this->domain,
            'isActive' => $this->is_active,
            'theme' => $this->theme,
            'logo' => $this->logo,
            'settings' => $this->settings,
            'domains' => $this->whenLoaded('domains', fn () => $this->domains->map(fn ($domain) => [
                'id' => $domain->id,
                'host' => $domain->host,
                'isPrimary' => $domain->is_primary,
                'isActive' => $domain->is_active,
            ])->values()),
            'createdAt' => optional($this->created_at)->toIso8601String(),
            'updatedAt' => optional($this->updated_at)->toIso8601String(),
        ];
    }
}
