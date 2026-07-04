<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScrapeLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'scrapeRunId' => $this->scrape_run_id,
            'url' => $this->url,
            'title' => $this->title,
            'status' => $this->status,
            'message' => $this->message,
            'payload' => $this->when($request->user() !== null, $this->payload),
            'createdAt' => $this->created_at,
        ];
    }
}
