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
            'title' => ['required', 'string', 'max:500'],
            'company_name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:191'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'job_type' => ['nullable', 'string', 'max:100'],
            'salary_text' => ['nullable', 'string', 'max:191'],
            'description' => ['required', 'string', 'max:65535'],
            'description_doc' => ['nullable', 'array'],
            'raw_description' => ['nullable', 'string', 'max:65535'],
            'source_url' => ['required', 'url', 'max:2048'],
            'source_name' => ['required', 'string', 'max:100'],
            'status' => ['nullable', 'in:raw,draft,published,rejected,duplicate'],
        ];
    }
}
