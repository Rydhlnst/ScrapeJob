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
            'jobs' => ['required', 'array'],
            'jobs.*.external_job_id' => ['required', 'string', 'max:191'],
            'jobs.*.source_url' => ['required', 'url', 'max:2048'],
            'jobs.*.title' => ['required', 'string'],
            'jobs.*.company_name' => ['required', 'string'],
            'jobs.*.location' => ['nullable', 'string', 'max:191'],
            'jobs.*.salary_min' => ['nullable', 'integer', 'min:0'],
            'jobs.*.salary_max' => ['nullable', 'integer', 'min:0'],
            'jobs.*.job_type' => ['nullable', 'string', 'max:191'],
            'jobs.*.work_arrangement' => ['nullable', 'string', 'max:191'],
            'jobs.*.description' => ['nullable', 'string'],
            'jobs.*.requirement' => ['nullable', 'string'],
            'jobs.*.posted_at' => ['nullable', 'date'],
            'jobs.*.scraped_at' => ['nullable', 'date'],
        ];
    }
}
