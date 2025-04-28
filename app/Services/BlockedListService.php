<?php

namespace app\Services;

use App\Models\BlockedList;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class BlockedListService
{
    /**
     * Fetches all the user's blocked users
     *
     * @return array Returns an array of blocked users
     */
    public function getBlockedUsers(): array
    {
        return BlockedList::blockedUsers(Auth::id())->get()
            ->map(function ($record) {
                $blockedUser = $record->blockedUser;

                $blockedUser->last_online = $blockedUser->last_online->diffForHumans();

                return $blockedUser;
            })
            ->toArray();
    }

    /**
     * Stores a new friend record
     *
     * @param  int   $blockedId Refers to the id of the new friend
     * @return array            Returns an array containing storage data
     */
    public function storeBlock(int $blockedId): array
    {
        $blockedUser = User::findOrFail($blockedId);

        BlockedList::create([
            "blocker_id" => Auth::id(),
            "blocked_id" => $blockedId,
        ]);

        return array_merge([
            "statusCode"  => 201,
            "type"        => "success",
            "message"     => __("block.made", ["name" => $blockedUser->name])
        ], $blockedUser->toArray());
    }

    /**
     * Deletes an existing friend record
     *
     * @param  int   $blockedId Refers to the id of the new friend
     * @return array            Returns an array containing deletion data
     */
    public function removeBlock(int $blockedId): array
    {
        $blockedUser = User::findOrFail($blockedId);

        $record = BlockedList::blockRecord(Auth::id(), $blockedId)->firstOrFail();

        $record->delete();

        return array_merge([
            "statusCode"  => 200,
            "type"        => "success",
            "message"     => __("block.removed", ["name" => $blockedUser->name])
        ]);
    }

}
