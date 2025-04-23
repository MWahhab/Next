<?php

namespace App\Models;

use App\Events\AcceptedFriendRequest;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int         $id         Refers to the id of the relationship record
 * @property int         $user_1_id  Refers to the id of user 1
 * @property int         $user_2_id  Refers to the id of user 2
 * @property string      $status     Refers to the relationship status between the two users
 * @property Carbon|null $created_at Refers to when the relationship was created
 * @property Carbon|null $updated_at Refers to when the relationship was last updated
 *
 * @property-read User $user1 Refers to the User data of User1. In the case of a block, this user initiated the block.
 * @property-read User $user2 Refers to the User data of User2. In the case of a block, this user has gotten blocked.
 *
 * @method static Builder relationshipsForUser(int $userId)        Returns a query of the user's relationships.
 * @method static Builder betweenUsers(int $user1Id, int $user2Id) Returns a query of any relationships between 2 users
 */
class Relationship extends Model
{
    protected $fillable = [
        'user_1_id',
        'user_2_id',
        'status',
    ];

    /**
     * Fetches the data of user 1. In the case of a block, this is the user that initiated the block.
     *
     * @return BelongsTo
     */
    public function user1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_1_id');
    }

    /**
     * Fetches the data of user 2. In the case of a block, this is the user that has gotten blocked.
     *
     * @return BelongsTo
     */
    public function user2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_2_id');
    }

    /**
     * Returns a query of the user's relationships. Requires chained methods like ->get() as a follow-up
     *
     * @param  Builder $query  Refers to the query builder
     * @param  int     $userId Refers to the id of the user whose friends are being queried
     * @return Builder         Returns a query of the user's relationships
     */
    public function scopeRelationshipsForUser(Builder $query, int $userId): Builder
    {
        return $query->with(['user1', 'user2'])
            ->where('user_1_id', $userId)
            ->orWhere('user_2_id', $userId);
    }

    /**
     * Returns a query of any relationships existing between two users
     *
     * @param  Builder $query   Refers to the query builder
     * @param  int     $user1Id Refers to the ID of user1
     * @param  int     $user2Id Refers to the ID of user2
     * @return Builder          Returns a query of any relationships existing between two users
     */
    public function scopeBetweenUsers(Builder $query, int $user1Id, int $user2Id): Builder
    {
        return $query
            ->where([
                "user_1_id" => $user1Id,
                "user_2_id" => $user2Id
            ])
            ->orWhere([
                "user_1_id" => $user2Id,
                "user_2_id" => $user1Id
            ]);
    }

    protected static function booted(): void
    {
        static::created(function ($request) {
            broadcast(New AcceptedFriendRequest(
                $request->user_2_id,
                $request->user1
            ));
        });
    }
}
