<?php

namespace App\Services\Jobs;

use App\Models\Job;
use InvalidArgumentException;

class JobPublishingService
{
    public function publish(Job $job): Job
    {
        if (blank($job->title) || blank($job->company_name) || blank($job->location) || blank($job->description) || blank($job->source_url)) {
            throw new InvalidArgumentException('Job is missing required fields for publish.');
        }

        $job->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        return $job->refresh();
    }

    public function unpublish(Job $job): Job
    {
        $job->update([
            'status' => 'draft',
            'published_at' => null,
        ]);

        return $job->refresh();
    }
}

