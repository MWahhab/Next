<?php

namespace App\Models;

use App\Enums\FriendRequestDeletionType;
use App\Events\NewFriendRequest;
use App\Events\RemovedFriendRequest;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
                $request->recipient->id
            ));
        });
    }
}
