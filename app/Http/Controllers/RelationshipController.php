<?php

namespace App\Http\Controllers;

use App\Models\Relationship;
use App\Services\FriendRequestService;
use App\Services\RelationshipService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RelationshipController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(RelationshipService $relationshipService, FriendRequestService $friendRequestService)
    {
        $relationships = $relationshipService->getRelationships();

        $requests = $friendRequestService->getFriendRequests();

        return Inertia::render("Friends/Index", array_merge($relationships, $requests));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Relationship $relationship)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Relationship $relationship)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Relationship $relationship)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Relationship $relationship)
    {
        //
    }
}
