<?php

namespace App\Services;

use App\Enums\FriendRequestDeletionType;
use App\Models\FriendRequest;
use App\Models\User;
use http\Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class FriendRequestService
{
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
            return back()->with(
                [
                    'statusCode' => 400,
                    'type'       => "failure",
                    'message'    => "The user doesn't exist!",
                ]
            );
        }

        FriendRequest::create(
            [
                'sender_id'    => Auth::id(),
                'recipient_id' => $recipient->id,
            ]
        );

        return [
            'recipientId'         => $recipient->id,
            'recipientName'       => $recipient->name,
            'recipientStatus'     => $recipient->status,
            'recipientAvatar'     => $recipient->avatar,
            'recipientLastOnline' => $recipient->last_online,
        ];
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
