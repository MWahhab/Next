<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeleteFriendRequest;
use App\Http\Requests\StoreFriendRequest;
use App\Services\BlockedListService;
use App\Services\FriendRequestService;
use App\Services\FriendsListService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FriendsListController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(
        FriendsListService $friendsListService,
        BlockedListService $blockedListService,
        FriendRequestService $friendRequestService
    ): Response
    {
        $friends      = $friendsListService->getFriends();
        $blockedUsers = $blockedListService->getBlockedUsers();

        $friendRequests = $friendRequestService->getFriendRequests();

        return Inertia::render("Friends/Index", array_merge(
            ["friends" => $friends, "blocked" => $blockedUsers],
            $friendRequests
        ));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFriendRequest $request, FriendsListService $friendsListService): RedirectResponse
    {
        $validatedRequest = $request->validated();

        $response = $friendsListService->storeFriend($validatedRequest["friendId"]);

        return back()->with($response);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DeleteFriendRequest $request, FriendsListService $friendsListService): RedirectResponse
    {
        $validatedRequest = $request->validated();

        $response = $friendsListService->deleteFriend($validatedRequest["friendId"]);

        return back()->with($response);
    }
}
