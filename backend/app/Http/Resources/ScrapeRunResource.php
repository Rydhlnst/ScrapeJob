<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScrapeRunResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'jobSourceId' => $this->job_source_id,
            'sourceName' => $this->source_name,
            'status' => $this->status,
            'startedAt' => $this->started_at,
            'finishedAt' => $this->finished_at,
            'totalFound' => $this->total_found,
            'mappedCount' => $this->mapped_count,
            'successCount' => $this->success_count,
            'duplicateCount' => $this->duplicate_count,
            'failedCount' => $this->failed_count,
            'errorCount' => $this->error_count,
            'skippedCount' => $this->skipped_count,
            'errorMessage' => $this->error_message,
            'samplePayloads' => $this->sample_payloads,
            'createdBy' => $this->created_by,
        ];
    }
}
