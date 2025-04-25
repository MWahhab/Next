<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeleteRelationshipRequest;
use App\Http\Requests\StoreRelationshipRequest;
use App\Models\Relationship;
use App\Models\User;
use App\Services\FriendRequestService;
use App\Services\RelationshipService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;

class RelationshipController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(RelationshipService $relationshipService, FriendRequestService $friendRequestService): Response
    {
        $relationships = $relationshipService->getRelationships();

        $requests = $friendRequestService->getFriendRequests();

        return Inertia::render("Friends/Index", array_merge($relationships, $requests));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(
        StoreRelationshipRequest $request,
        User $otherUser,
        RelationshipService $relationshipService
    ): RedirectResponse
    {
        if(!$otherUser->exists) {
            abort(400, "Invalid user passed to store relationship.");
        }

        $validatedRequest = $request->validated();

        $response = $relationshipService->storeRelationship($validatedRequest, $otherUser);

        return back()->with($response);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(
        DeleteRelationshipRequest $request,
        User $otherUser,
        RelationshipService $relationshipService
    ): RedirectResponse
    {
        if(!$otherUser->exists) {
            abort(400, "Invalid user passed to delete relationship.");
        }

        $validatedRequest = $request->validated();

        $response = $relationshipService->deleteRelationship($otherUser, $validatedRequest["currentRelationship"]);

        return back()->with($response);
    }
}
