<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string'],
            'company_name' => ['required', 'string'],
            'location' => ['required', 'string'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'job_type' => ['nullable', 'string'],
            'salary_text' => ['nullable', 'string'],
            'description' => ['required', 'string'],
            'raw_description' => ['nullable', 'string'],
            'source_url' => ['required', 'url'],
            'source_name' => ['required', 'string'],
            'status' => ['nullable', 'in:raw,draft,published,rejected,duplicate'],
        ];
    }
}
