<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdminRoute = $request->is('api/admin/*');

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'companyName' => $this->company_name,
            'companyLogo' => $this->company_logo_url,
            'location' => $this->location,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'jobType' => $this->job_type,
            'salaryText' => $this->salary_text,
            'description' => $this->description,
            'descriptionDoc' => $this->description_doc,
            'sourceUrl' => $this->source_url,
            'sourceName' => $this->source_name,
            'publishedAt' => $this->published_at,
            'createdAt' => $this->created_at,
            'rawDescription' => $this->when($isAdminRoute, $this->raw_description),
            'contentHash' => $this->when($isAdminRoute, $this->content_hash),
            'status' => $this->when($isAdminRoute, $this->status),
            'scrapedAt' => $this->when($isAdminRoute, $this->scraped_at),
            'updatedAt' => $this->when($isAdminRoute, $this->updated_at),
            'requirements' => $this->when($isAdminRoute, $this->requirements),
            'responsibilities' => $this->when($isAdminRoute, $this->responsibilities),
            'skills' => $this->when($isAdminRoute, $this->skills),
            'benefits' => $this->when($isAdminRoute, $this->benefits),
            'unified' => $this->when($isAdminRoute, $this->unified_payload),
        ];
    }
}
