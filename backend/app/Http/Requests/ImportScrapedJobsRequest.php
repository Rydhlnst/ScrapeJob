<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportScrapedJobsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source' => ['required', 'string', 'max:50'],
            'scraped_at' => ['nullable', 'date'],
            'total' => ['nullable', 'integer', 'min:0'],
            'jobs' => ['required', 'array', 'max:500'],
            'jobs.*.external_job_id' => ['required', 'string', 'max:191'],
            'jobs.*.source_url' => ['required', 'url', 'max:2048'],
            'jobs.*.title' => ['required', 'string', 'max:500'],
            'jobs.*.company_name' => ['required', 'string', 'max:255'],
            'jobs.*.location' => ['nullable', 'string', 'max:191'],
            'jobs.*.salary_min' => ['nullable', 'integer', 'min:0'],
            'jobs.*.salary_max' => ['nullable', 'integer', 'min:0'],
            'jobs.*.job_type' => ['nullable', 'string', 'max:191'],
            'jobs.*.work_arrangement' => ['nullable', 'string', 'max:191'],
            'jobs.*.description' => ['nullable', 'string', 'max:65535'],
            'jobs.*.requirement' => ['nullable', 'string', 'max:65535'],
            'jobs.*.posted_at' => ['nullable', 'date'],
            'jobs.*.scraped_at' => ['nullable', 'date'],
        ];
    }
}
