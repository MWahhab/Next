<?php

namespace app\Services;

use App\Models\Relationship;
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

        return Relationship::with(['user1', 'user2'])
            ->where('user_1_id', $currentUserId)
            ->orWhere('user_2_id', $currentUserId)
            ->get()
            ->map(function ($relation) use ($currentUserId) {
                return [
                    "status"    => $relation->status,
                    "otherUser" => $relation->user_1_id === $currentUserId ?
                        $relation->user2->toArray() : $relation->user1->toArray(),
                ];
            })
            ->groupBy('status')
            ->map(function ($group) {
                return $group->map(function ($relation) {
                    unset($relation['status']);
                    return $relation;
                });
            })
            ->toArray();

    }

    /**
     * Stores a new relationship
     *
     * @param  array $validatedRequest Refers to the validated request data
     * @return array
     */
    public function storeRelationship(array $validatedRequest): array
    {
        if(empty($validatedData)) {
            abort(500, "Issue with storing validated friend request data");
        }

        $isBlocked = $validatedRequest['relationshipType'] === RelationEnum::BLOCKED->value;

        return Relationship::create([
            'user_1_id' => $isBlocked ? Auth::id() : $validatedRequest['blockedUserId'],
            'user_2_id' => $isBlocked ? $validatedRequest['initiatorId'] : Auth::id(),
            'status'    => $validatedRequest['relationshipType']
        ]);


    }
}
