<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobSourceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'baseUrl' => $this->base_url,
            'listingUrl' => $this->listing_url,
            'isActive' => $this->is_active,
            'scrapingAllowed' => $this->scraping_allowed,
            'notes' => $this->notes,
            'lastScrapedAt' => $this->last_scraped_at,
            'createdAt' => $this->created_at,
        ];
    }
}
