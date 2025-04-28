<?php

namespace App\Http\Controllers;

use App\Enums\FriendRequestDeletionType;
use App\Http\Requests\NewFriendRequestRequest;
use App\Http\Requests\RemoveFriendRequestRequest;
use App\Models\User;
use App\Services\FriendRequestService;
use \Illuminate\Http\RedirectResponse;

class FriendRequestController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(NewFriendRequestRequest $request, FriendRequestService $requestService): RedirectResponse
    {
        $validatedRequest = $request->validated();

        $recipientRequestData = $requestService->storeFriendRequest($validatedRequest["recipientEmail"]);

        return back()->with($recipientRequestData);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(
        RemoveFriendRequestRequest $request, User $sender, User $recipient, FriendRequestService $requestService
    ): RedirectResponse
    {
        $validatedDeletionType = $request->validated();

        $deletionTypeEnum = FriendRequestDeletionType::from($validatedDeletionType["deletionType"]);

        $deletionInfo =
            $requestService->deleteFriendRequest($sender, $recipient, $deletionTypeEnum);

        return back()->with($deletionInfo);
    }
}
