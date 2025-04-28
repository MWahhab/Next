<?php

namespace app\Services;

use App\Models\FriendRequest;
use App\Models\FriendsList;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class FriendsListService
{

    /**
     * Fetches all the user's friends
     *
     * @return array Returns an array of the user's friends
     */
    public function getFriends(): array
    {
        return FriendsList::friendsForUser(Auth::id())->get()
            ->map(function ($record) {
                $friend = $record->user_1_id == Auth::id() ? $record->user2->toArray() : $record->user1->toArray();

                $friend["last_online"] = Carbon::create($friend["last_online"])->diffForHumans();

                return $friend;
            })->toArray();
    }

    /**
     * Stores a new friend record
     *
     * @param  int   $friendId Refers to the id of the new friend
     * @return array           Returns an array containing storage data
     */
    public function storeFriend(int $friendId): array
    {
        $friend = User::findOrFail($friendId);

        FriendsList::create([
            "user_1_id" => Auth::id(),
            "user_2_id" => $friendId,
        ]);

        FriendRequest::betweenUsers($friendId, Auth::id())->delete();

        $friend = $friend->toArray();

        $friend["last_online"] = Carbon::create($friend["last_online"])->diffForHumans();

        return array_merge([
            "statusCode"  => 201,
            "type"        => "success",
            "message"     => __("friend.added", ["name" => $friend["name"]])
        ], $friend);
    }

    /**
     * Deletes an existing friend record
     *
     * @param  int   $friendId Refers to the id of the other user in the friendship
     * @return array           Returns an array containing deletion data
     */
    public function deleteFriend(int $friendId): array
    {
        $friend = User::findOrFail($friendId);

        $record = FriendsList::friendRecord(Auth::id(), $friendId)->firstOrFail();

        $record->listenerId = $friendId;
        $record->removerId  = Auth::id();

        $record->delete();

        return array_merge([
            "statusCode"  => 200,
            "type"        => "success",
            "message"     => __("friend.deleted", ["name" => $friend->name])
        ]);
    }

}
