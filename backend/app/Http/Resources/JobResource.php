<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAdminRoute = $request->is('api/admin/*');
        $websiteJob = $this->relationLoaded('websiteJobs') ? $this->websiteJobs->first() : null;
        $content = $websiteJob?->relationLoaded('content') ? $websiteJob->content : null;
        $category = $content?->relationLoaded('category') && $content->category
            ? $content->category
            : ($this->relationLoaded('category') ? $this->category : null);

        return [
            'id' => $this->id,
            'title' => $content?->title ?: $this->title,
            'slug' => $content?->slug ?: $this->slug,
            'companyName' => $this->company_name,
            'companyLogo' => $this->company_logo_url,
            'location' => $this->location,
            'category' => new CategoryResource($category),
            'jobType' => $this->job_type,
            'salaryText' => $content?->salary_text ?: $this->salary_text,
            'description' => $content?->description ?: $this->description,
            'descriptionDoc' => $this->description_doc,
            'sourceUrl' => $this->source_url,
            'applyUrl' => $content?->apply_url ?: $this->apply_url,
            'sourceName' => $this->source_name,
            'publishedAt' => $this->published_at,
            'createdAt' => $this->created_at,
            'seoTitle' => $content?->seo_title,
            'seoDescription' => $content?->seo_description,
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
