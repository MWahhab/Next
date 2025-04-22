<?php

namespace App\Services;

use App\Enums\FriendRequestDeletionType;
use App\Models\FriendRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;

class FriendRequestService
{
    /**
     * Fetches all the friend requests made by and to the user
     *
     * @return array Refers to an array which contains incoming and outgoing requests
     */
    public function getFriendRequests(): array
    {
        $userId = Auth::id();

        return FriendRequest::with(["sender", "recipient"])
            ->where("sender_id", $userId)
            ->orWhere("recipient_id", $userId)
            ->get()
            ->map(function ($friendRequest) use ($userId) {
                $isSender = $friendRequest->sender_id === $userId;

                $otherPerson = $isSender ? $friendRequest->recipient->toArray() : $friendRequest->sender->toArray();
                $requestType = $isSender ? "outgoingFriendRequests" : "incomingFriendRequests";

                $otherPerson["last_online"] = Carbon::create($otherPerson["last_online"])->diffForHumans();

                return [
                    "otherPerson" => $otherPerson,
                    "requestType" => $requestType
                ];
            })
            ->groupBy("requestType")
            ->map(function ($requestType) {
                return $requestType->pluck("otherPerson");
            })
            ->toArray();
    }

    /**
     * Stores new request in DB
     *
     * @param  array                  $validatedData Refers to the validated HTTP request data
     * @return array|RedirectResponse
     */
    public function storeFriendRequest(array $validatedData): array|RedirectResponse
    {
        if(empty($validatedData)) {
            abort(500, "Issue with storing validated friend request data");
        }

        $recipient = User::where('email', $validatedData['recipientEmail'])->first();

        if(!$recipient) {
            return [
                'statusCode' => 400,
                'type'       => "failure",
                'message'    => "The user doesn't exist!",
            ];
        }

        if($recipient->id == Auth::id()) {
            return [
                'statusCode' => 422,
                'type'       => "failure",
                'message'    => "You cannot send a friend request to yourself!",
            ];
        }

        FriendRequest::create(
            [
                'sender_id'    => Auth::id(),
                'recipient_id' => $recipient->id,
            ]
        );

        return array_merge([
            'statusCode' => 201,
            'type'       => "success",
            'message'    => "Friend request sent to {$recipient->email}!"
        ], $recipient->toArray());
    }

    /**
     * Deletes a request
     * @param  User                      $sender       Refers to the user who made the friend request
     * @param  User                      $recipient    Refers to the user who received the friend request
     * @param  FriendRequestDeletionType $deletionType Refers to whether the request removal was a rejection or cancellation
     * @return string                                  Returns a message for the user
     */
    public function deleteFriendRequest(User $sender, User $recipient, FriendRequestDeletionType $deletionType): string
    {
        $friendRequest =
            FriendRequest::where('sender_id', $sender->id)->where('recipient_id', $recipient->id)->firstOrFail();

        $deletionMessage =  $deletionType == FriendRequestDeletionType::REJECTION ?
            "Friend request from {$sender->name} rejected!" :
            "Friend request to {$recipient->name} removed!";

        /**
         * @var FriendRequest $friendRequest
         */
        $friendRequest->deleteWithEvent($deletionType);

        return $deletionMessage;
    }
}
