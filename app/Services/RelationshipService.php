<?php

namespace app\Services;

use App\Models\FriendRequest;
use App\Models\Relationship;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Enums\RelationshipType as RelationEnum;

class RelationshipService
{
    /**
     * Gets the relationships of the current user and separates them into friends and blocked users
     *
     * @return array Refers to an array containing both friends and blocked users
     */
    public function getRelationships(): array
    {
        $currentUserId = Auth::id();

        return Relationship::relationshipsForUser($currentUserId)
            ->get()
            ->map(function ($relation) use ($currentUserId) {
                $otherUser = $relation->user_1_id === $currentUserId ?
                    $relation->user2->toArray() : $relation->user1->toArray();

                $otherUser["last_online"] = Carbon::create($otherUser["last_online"])->diffForHumans();

                return [
                    "status"    => $relation->status,
                    "otherUser" => $otherUser
                ];
            })
            ->groupBy('status')
            ->map(function ($relationshipData) {
                return $relationshipData->pluck('otherUser');
            })
            ->toArray();

    }

    /**
     * Stores a new relationship
     *
     * @param  array $validatedRequest Refers to the validated request data
     * @param  User  $otherUser        Refers to the user model of the other user
     * @return array
     */
    public function storeRelationship(array $validatedRequest, User $otherUser): array
    {
        $userId    = Auth::id();
        $status    = $validatedRequest['relationshipType'];

        FriendRequest::betweenUsers($userId, $otherUser->id)->delete();

        $isBlocked = $status === RelationEnum::BLOCKED;

        $existingRelationships = Relationship::betweenUsers($userId, $otherUser->id)->get();

        if ($isBlocked && $existingRelationships->isNotEmpty()) {
            if ($existingRelationships->count() > 1) {
                abort(500, "Both users have already blocked one another");
            }

            $relationship = $existingRelationships->first();

            $currentlyFriends = $relationship->status === RelationEnum::FRIENDS->value;

            if (!$currentlyFriends && $relationship->user_1_id === $userId) {
                abort(500, "User is already blocked");
            }

            if ($currentlyFriends) {
                $relationship->delete();
            }
        }

        $newRelationship = Relationship::create([
            'user_1_id' => $userId,
            'user_2_id' => $otherUser->id,
            'status'    => $status,
        ]);

        $messageKey = $isBlocked ? "relationship.blocked" : "relationship.friend_added";

        return array_merge([
            "statusCode"  => 201,
            "type"        => "success",
            "message"     => __($messageKey, ["name" => $otherUser->name])
        ], $otherUser->makeHidden([
            "forced_status",
            "email_verified_at",
            "created_at",
            "updated_at"
        ])->toArray());
    }
}
