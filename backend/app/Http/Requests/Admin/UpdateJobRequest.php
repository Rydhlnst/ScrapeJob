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
            'title' => ['sometimes', 'required', 'string'],
            'company_name' => ['sometimes', 'required', 'string'],
            'location' => ['sometimes', 'required', 'string'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'job_type' => ['nullable', 'string'],
            'salary_text' => ['nullable', 'string'],
            'description' => ['sometimes', 'required', 'string'],
            'raw_description' => ['nullable', 'string'],
            'source_url' => ['sometimes', 'required', 'url'],
            'source_name' => ['sometimes', 'required', 'string'],
            'status' => ['nullable', 'in:raw,draft,published,rejected,duplicate'],
        ];
    }
}
