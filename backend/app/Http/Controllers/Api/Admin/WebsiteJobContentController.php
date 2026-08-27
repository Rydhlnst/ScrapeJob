<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Job;
use App\Models\WebsiteJob;
use App\Models\WebsiteJobContent;
use App\Services\WebsiteContext;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WebsiteJobContentController extends Controller
{
    public function show(Job $job, Request $request, WebsiteContext $websiteContext)
    {
        $website = $websiteContext->resolve($request);
        $websiteJob = WebsiteJob::query()->firstOrCreate(
            ['website_id' => $website->id, 'job_id' => $job->id],
            ['status' => 'unused'],
        );
        $content = $websiteJob->content()->with('category')->first();

        return ApiResponse::success([
            'website' => ['id' => $website->id, 'name' => $website->name],
            'jobId' => $job->id,
            'content' => $content ? [
                'id' => $content->id,
                'title' => $content->title,
                'slug' => $content->slug,
                'description' => $content->description,
                'salaryText' => $content->salary_text,
                'applyUrl' => $content->apply_url,
                'categoryId' => $content->category_id,
                'tags' => $content->tags,
                'seoTitle' => $content->seo_title,
                'seoDescription' => $content->seo_description,
                'category' => $content->category,
            ] : null,
        ], 'Website job content retrieved successfully');
    }

    public function update(Job $job, Request $request, WebsiteContext $websiteContext)
    {
        $website = $websiteContext->resolve($request);
        $payload = $request->validate([
            'title' => ['nullable', 'string', 'max:500'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash'],
            'description' => ['nullable', 'string', 'max:200000'],
            'salary_text' => ['nullable', 'string', 'max:500'],
            'apply_url' => ['nullable', 'url', 'max:2048'],
            'category_id' => ['nullable', 'uuid'],
            'tags' => ['nullable', 'array', 'max:30'],
            'tags.*' => ['string', 'max:100'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:500'],
        ]);

        if (!empty($payload['category_id'])) {
            $category = Category::query()
                ->whereKey($payload['category_id'])
                ->where('website_id', $website->id)
                ->first();
            if (!$category) {
                throw ValidationException::withMessages([
                    'category_id' => 'The selected category does not belong to the active website.',
                ]);
            }
        }

        $websiteJob = WebsiteJob::query()->firstOrCreate(
            ['website_id' => $website->id, 'job_id' => $job->id],
            ['status' => 'unused'],
        );
        $content = $websiteJob->content()->firstOrNew([
            'website_job_id' => $websiteJob->id,
        ]);
        $content->fill($payload + [
            'website_id' => $website->id,
            'job_id' => $job->id,
        ]);

        if ($content->slug) {
            $duplicate = WebsiteJobContent::query()
                ->where('website_id', $website->id)
                ->where('slug', $content->slug)
                ->where('website_job_id', '!=', $websiteJob->id)
                ->exists();
            if ($duplicate) {
                throw ValidationException::withMessages(['slug' => 'This slug is already used on the active website.']);
            }
        }

        $content->save();

        return ApiResponse::success([
            'website' => ['id' => $website->id, 'name' => $website->name],
            'jobId' => $job->id,
            'content' => [
                'id' => $content->id,
                'title' => $content->title,
                'slug' => $content->slug,
                'description' => $content->description,
                'salaryText' => $content->salary_text,
                'applyUrl' => $content->apply_url,
                'categoryId' => $content->category_id,
                'tags' => $content->tags,
                'seoTitle' => $content->seo_title,
                'seoDescription' => $content->seo_description,
            ],
        ], 'Website job content saved successfully');
    }
}
