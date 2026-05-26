<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RunScrapeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source' => ['required', 'string', 'max:50'],
            'keyword' => ['nullable', 'string', 'max:191'],
            'location' => ['nullable', 'string', 'max:191'],
        ];
    }
}
