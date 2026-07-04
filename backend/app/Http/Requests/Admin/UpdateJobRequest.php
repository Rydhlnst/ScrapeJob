<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:500'],
            'company_name' => ['sometimes', 'required', 'string', 'max:255'],
            'location' => ['sometimes', 'required', 'string', 'max:191'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'job_type' => ['nullable', 'string', 'max:100'],
            'salary_text' => ['nullable', 'string', 'max:191'],
            'description' => ['sometimes', 'required', 'string', 'max:65535'],
            'raw_description' => ['nullable', 'string', 'max:65535'],
            'source_url' => ['sometimes', 'required', 'url', 'max:2048'],
            'source_name' => ['sometimes', 'required', 'string', 'max:100'],
            'status' => ['nullable', 'in:raw,draft,published,rejected,duplicate'],
        ];
    }
}
