<?php

namespace App\Services;

use App\Enums\FriendRequestDeletionType;
use App\Models\BlockedList;
use App\Models\FriendRequest;
use App\Models\FriendsList;
use App\Models\Relationship;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
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

        return FriendRequest::requestsForUser($userId)
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
            ->map(function ($requestData) {
                return $requestData->pluck("otherPerson");
            })
            ->toArray();
    }

    /**
     * Stores new request in DB
     *
     * @param  string                 $recipientEmail Refers to the recipient's email
     * @return array|RedirectResponse
     */
    public function storeFriendRequest(string $recipientEmail): array|RedirectResponse
    {
        if(!$recipientEmail || strlen($recipientEmail) < 1) {
            abort(500, "Issue with storing friend request due to invalid email");
        }

        $recipient = User::where('email', $recipientEmail)->firstOrFail();

        if(!$recipient) {
            return [
                'statusCode' => 400,
                'type'       => "failure",
                'message'    => __("friend_request.user_nonexistent"),
            ];
        }

        if(FriendRequest::betweenUsers(Auth::id(), $recipient->id)->exists()) {
            return [
                'statusCode' => 409,
                'type'       => "failure",
                'message'    => __("friend_request.already_exists", ["name" => $recipient->name]),
            ];
        }

        $areFriends = FriendsList::friendRecord(Auth::id(), $recipient->id)->exists();
        $areBlocked = BlockedList::blockRecord(Auth::id(), $recipient->id)->exists() ||
            BlockedList::blockRecord(Auth::id(), $recipient->id)->exists();

        if($areFriends || $areBlocked) {
            $messageKey = $areBlocked ? "friend_request.blocked" : "friend_request.already_friends";

            return [
                'statusCode' => 409,
                'type'       => "failure",
                'message'    => __($messageKey, ["name" => $recipient->name])
            ];
        }

        if($recipient->id == Auth::id()) {
            return [
                'statusCode' => 422,
                'type'       => "failure",
                'message'    => __("friend_request.sent_to_self"),
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
            'message'    => __("friend_request.sent", ["name" => $recipient->name]),
        ], $recipient->toArray());
    }

    /**
     * Deletes a request
     * @param  User                      $sender       Refers to the user who made the friend request
     * @param  User                      $recipient    Refers to the user who received the friend request
     * @param  FriendRequestDeletionType $deletionType Refers to whether the request removal was a rejection or
     * cancellation
     * @return array                                   Returns an array containing deletion info, including status
     */
    public function deleteFriendRequest(User $sender, User $recipient, FriendRequestDeletionType $deletionType): array
    {
        $friendRequest =
            FriendRequest::where('sender_id', $sender->id)->where('recipient_id', $recipient->id)->firstOrFail();

        $deletionMessage =  $deletionType == FriendRequestDeletionType::REJECTION ?
            __("friend_request.rejected", ["name" => $sender->name]) :
            __("friend_request.cancelled", ["name" => $recipient->name]);

        /**
         * @var FriendRequest $friendRequest
         */
        $friendRequest->deleteWithEvent($deletionType);

        return [
            'statusCode' => 200,
            'type'       => "success",
            'message'    => $deletionMessage
        ];
    }
}
