<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCategoryRequest;
use App\Http\Requests\Admin\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Support\ApiResponse;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::query()->orderBy('name')->paginate(15);

        return ApiResponse::paginated($categories, CategoryResource::collection($categories)->resolve(), 'Categories retrieved successfully');
    }

    public function store(StoreCategoryRequest $request)
    {
        $name = $request->string('name')->value();

        $category = Category::query()->create([
            'name' => $name,
            'slug' => $this->makeUniqueSlug($name),
            'description' => $request->input('description'),
        ]);

        return ApiResponse::success(new CategoryResource($category), 'Category created successfully', 201);
    }

    public function show(Category $category)
    {
        return ApiResponse::success(new CategoryResource($category), 'Category retrieved successfully');
    }

    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $payload = $request->validated();

        if (array_key_exists('name', $payload)) {
            $payload['slug'] = $this->makeUniqueSlug($payload['name'], $category->id);
        }

        $category->update($payload);

        return ApiResponse::success(new CategoryResource($category->refresh()), 'Category updated successfully');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return ApiResponse::success(null, 'Category deleted successfully');
    }

    private function makeUniqueSlug(string $name, ?string $exceptId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $counter = 1;

        while (Category::query()->where('slug', $slug)->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))->exists()) {
            $slug = $base.'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
