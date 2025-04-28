<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int         $id         Refers to the id of the block record
 * @property int         $blocker_id Refers to the id of the blocker
 * @property int         $blocked_id Refers to the id of the blocked user
 * @property Carbon|null $created_at Refers to when the block was created
 * @property Carbon|null $updated_at Refers to when the block was last updated
 *
 * @property-read User $blocker Refers to the User data of the blocked
 * @property-read User $blocked Refers to the User data of the blocked user
 *
 * @method static Builder blockedUsers(int $userId)                    Returns a query of all blocks made by the user
 * @method static Builder blockRecord(int $blockerId, int $blockedId)  Returns a query of a block record
 */
class BlockedList extends Model
{
    protected $fillable = [
        'blocker_id',
        'blocked_id',
    ];

    /**
     * Fetches the data of the blocker
     *
     * @return BelongsTo
     */
    public function blocker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'blocker_id');
    }

    /**
     * Fetches the data of the blocked user
     *
     * @return BelongsTo
     */
    public function blockedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'blocked_id');
    }

    /**
     * Returns a query of the user's blocked list records. Requires chained methods like ->get() as a follow-up
     *
     * @param  Builder $query     Refers to the query builder
     * @param  int     $blockerId Refers to the id of the user whose blocked list is being queried
     * @return Builder            Returns a query of the user's blocked list records
     */
    public function scopeBlockedUsers(Builder $query, int $blockerId): Builder
    {
        return $query->with(['blocked', 'blockedUser'])->where('blocker_id', $blockerId);
    }

    /**
     * Returns a query of a block record. Requires chained methods like ->get() as a follow-up
     *
     * @param  Builder $query     Refers to the query builder
     * @param  int     $blockerId Refers to the id of the user who made the block
     * @param  int     $blockedId Refers to the id of the user who was blocked
     * @return Builder            Returns a query of the user's blocked list records
     */
    public function scopeBlockRecord(Builder $query, int $blockerId, int $blockedId): Builder
    {
        return $query->where(['blocker_id' => $blockerId, 'blocked_id' => $blockedId]);
    }

    protected static function booted(): void
    {
//        static::created(function ($request) {
//            broadcast(New Block(
//                $request->user_2_id,
//                $request->user1
//            ));
//        });
//
//        static::deleted(function ($request) {
//            broadcast(New Unblock(
//                $request->listenerId,
//                $request->removerId
//            ));
//        });
    }
}
