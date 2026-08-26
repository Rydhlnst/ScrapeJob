<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScrapedJobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'externalId' => $this->external_id,
            'source' => $this->source,
            'sourceUrl' => $this->source_url,
            'roleKeyword' => $this->role_keyword,
            'title' => $this->title,
            'company' => $this->company,
            'location' => $this->location,
            'salary' => $this->salary,
            'employmentType' => $this->employment_type,
            'description' => $this->description,
            'descriptionSummary' => $this->description_summary,
            'postedDate' => optional($this->posted_date)->toDateString(),
            'scrapedAt' => optional($this->scraped_at)->toIso8601String(),
            'status' => $this->status,
            'draftStatus' => $this->draft_status,
            'failReason' => $this->fail_reason,
            'raw' => $this->raw_json,
            'createdAt' => optional($this->created_at)->toIso8601String(),
            'updatedAt' => optional($this->updated_at)->toIso8601String(),
            'assignments' => $this->whenLoaded('job', function (): array {
                $job = $this->job;
                if (! $job || ! $job->relationLoaded('websiteJobs')) {
                    return [];
                }

                return $job->websiteJobs->map(fn ($assignment) => [
                    'id' => $assignment->id,
                    'websiteId' => $assignment->website_id,
                    'status' => $assignment->status,
                    'website' => $assignment->relationLoaded('website') ? [
                        'id' => $assignment->website->id,
                        'name' => $assignment->website->name,
                        'domain' => $assignment->website->domain,
                    ] : null,
                ])->values()->all();
            }),
        ];
    }
}
