<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WebsiteJobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'websiteId' => $this->website_id,
            'jobId' => $this->job_id,
            'status' => $this->status,
            'publishedAt' => optional($this->published_at)->toIso8601String(),
            'expiredAt' => optional($this->expired_at)->toIso8601String(),
            'website' => new WebsiteResource($this->whenLoaded('website')),
            'job' => new JobResource($this->whenLoaded('job')),
        ];
    }
}
