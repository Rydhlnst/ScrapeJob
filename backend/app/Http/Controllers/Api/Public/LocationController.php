<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use App\Support\ApiResponse;

class LocationController extends Controller
{
    public function index()
    {
        $locations = Location::query()->orderBy('name')->get();

        return ApiResponse::success(LocationResource::collection($locations), 'Locations retrieved successfully');
    }
}
