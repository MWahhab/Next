<?php

namespace App\Models;

use App\Enums\FriendRequestDeletionType;
use App\Events\NewFriendRequest;
use App\Events\RemovedFriendRequest;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $sender_id    Refers to the id of the person who made the friend request
 * @property int $recipient_id Refers to the id of the person who received the request
 *
 * @property-read User $sender    Refers to the details of the user who sent the request
 * @property-read User $recipient Refers to the details of the user who received the request
 *
 * @method static Builder requestsForUser(int $userId)         Returns a query of the user's requests.
 * @method static Builder betweenUsers(int $user1Id, int $user2Id) Returns a query of request records between two users
 */
class FriendRequest extends Model
{
    protected $fillable = [
        'sender_id',
        'recipient_id'
    ];

    /**
     *  Retrieves the sender of the request
     *
     * @return BelongsTo
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::Class, 'sender_id');
    }

    /**
     * Retrieves the recipient of the request
     *
     * @return BelongsTo
     */
    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /**
     * Returns a query of the user's friend requests. Requires chained methods like ->get() as a follow-up
     *
     * @param  Builder $query  Refers to the query builder
     * @param  int     $userId Refers to the id of the user that's having their requests queried
     * @return Builder         Returns a query of all the user's requests
     */
    public function scopeRequestsForUser(Builder $query, int $userId): Builder
    {
        return $query->with(['sender', 'recipient'])
            ->where('sender_id', $userId)
            ->orWhere('recipient_id', $userId);
    }

    /**
     * Returns a query of any friend request records between these two users
     *
     * @param  Builder $query   Refers to the query builder
     * @param  int     $user1Id Refers to the id of one user
     * @param  int     $user2Id Refers to the id of another user
     * @return Builder          Returns a query of any friend request records between these two users
     */
    public function scopeBetweenUsers(Builder $query, int $user1Id, int $user2Id): Builder
    {
        return $query->where([
            'sender_id'    => $user1Id,
            'recipient_id' => $user2Id,
        ])
        ->orWhere([
            'sender_id'    => $user2Id,
            'recipient_id' => $user1Id,
        ]);
    }

    /**
     * Deletes record and fires off event listener. Avoids delete() issue with pivot tables in eloquent
     *
     * @param  FriendRequestDeletionType $type Refers to whether the request deletion was a rejection or cancellation
     * @return void
     */
    public function deleteWithEvent(FriendRequestDeletionType $type): void
    {
        broadcast(new RemovedFriendRequest(
            $this->sender_id,
            $this->recipient,
            $type
        ));

        static::where('sender_id', $this->sender_id)
            ->where('recipient_id', $this->recipient_id)
            ->delete();
    }

    /**
     * Fires when CRUD methods like create() and delete() are called
     *
     * @return void
     */
    protected static function booted(): void
    {
        static::created(function ($request) {
            broadcast(new NewFriendRequest(
                $request->sender,
                $request->recipient->id,
            ));
        });
    }
}
