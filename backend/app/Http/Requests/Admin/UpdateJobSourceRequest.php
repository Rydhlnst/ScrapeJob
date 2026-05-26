<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobSourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'base_url' => ['sometimes', 'required', 'url'],
            'listing_url' => ['nullable', 'url'],
            'is_active' => ['sometimes', 'boolean'],
            'scraping_allowed' => ['sometimes', 'boolean'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
