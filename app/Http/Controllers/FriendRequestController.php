<?php

namespace App\Http\Controllers;

use App\Enums\FriendRequestDeletionType;
use App\Http\Requests\DeleteUserRequest;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use App\Services\FriendRequestService;
use \Illuminate\Http\RedirectResponse;

class FriendRequestController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request, FriendRequestService $requestService): RedirectResponse
    {
        $validatedRequest = $request->validated();

        $recipientRequestData = $requestService->storeFriendRequest($validatedRequest);

        return back()->with($recipientRequestData);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(
        DeleteUserRequest $request, User $sender, User $recipient, FriendRequestService $requestService
    ): \Illuminate\Http\RedirectResponse
    {
        if(!$sender->exists | !$recipient->exists) {
            abort(404, "Cannot delete friend request as invalid sender/recipient object fetched.");
        };

        $validatedDeletionType = $request->validated();

        $deletionTypeEnum = FriendRequestDeletionType::from($validatedDeletionType["deletionType"]);

        $deletionInfo =
            $requestService->deleteFriendRequest($sender, $recipient, $deletionTypeEnum);

        return back()->with($deletionInfo);
    }
}
