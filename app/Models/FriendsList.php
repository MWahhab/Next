<?php

namespace App\Models;

use App\Events\AcceptedFriendRequest;
use App\Events\RemovedFriend;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int         $id         Refers to the id of the friend record
 * @property int         $user_1_id  Refers to the id of user 1
 * @property int         $user_2_id  Refers to the id of user 2
 * @property Carbon|null $created_at Refers to when the friend record was created
 * @property Carbon|null $updated_at Refers to when the friend record was last updated
 *
 * @property-read User $user1 Refers to the User data of User1
 * @property-read User $user2 Refers to the User data of User2
 *
 * @method static Builder friendsForUser(int $userId)              Returns a query of the user's friends
 * @method static builder friendRecord(int $userId, int $friendId) Returns a query of a friend record
 */
class FriendsList extends Model
{
    protected $fillable = [
        'user_1_id',
        'user_2_id',
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
     * Returns a query of the user's friends. Requires chained methods like ->get() as a follow-up
     *
     * @param  Builder $query  Refers to the query builder
     * @param  int     $userId Refers to the id of the user whose friends are being queried
     * @return Builder         Returns a query of the user's friends
     */
    public function scopeFriendsForUser(Builder $query, int $userId): Builder
    {
        return $query->with(['user1', 'user2'])
            ->where('user_1_id', $userId)
            ->orWhere('user_2_id', $userId);
    }

    /**
     * Returns a query of a friend record. Requires chained methods like ->get() as a follow-up
     *
     * @param  Builder $query    Refers to the query builder
     * @param  int     $userId   Refers to the id of one of the friends in the relationship
     * @param  int     $friendId Refers to the id of the other friend in the relationship
     * @return Builder           Returns a query of this friend record
     */
    public function scopefriendRecord(Builder $query, int $userId, int $friendId): Builder
    {
        return $query
            ->where(["user_1_id" => $userId, "user_2_id" => $friendId])
            ->orWhere(['user_1_id' => $friendId, 'user_2_id' => $userId]);
    }

    protected static function booted(): void
    {
        static::created(function ($request) {
            broadcast(New AcceptedFriendRequest(
                $request->user_2_id,
                $request->user1
            ));
        });

        static::deleted(function ($request) {
            broadcast(New RemovedFriend(
                $request->listenerId,
                $request->removerId
            ));
        });
    }
}
