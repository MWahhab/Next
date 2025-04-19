<?php

namespace App\Models;

use App\Events\NewFriendRequest;
use App\Events\RemovedFriendRequest;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Request extends Model
{
    protected $fillable = [
        'sender_id',
        'recipient_id',
        'type'
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
     * Fires when Request::delete() is called
     *
     * @return void
     */
    protected static function booted()
    {
        static::created(function ($request) {
            // add broadcast for making chat reqeust

            broadcast(new NewFriendRequest(
                $request->sender,
                $request->recipient->id,
                $request->friendRequestId
            ));
        });

        static::deleted(function ($request) {
            //add broadcast for removing chat request

            broadcast(new RemovedFriendRequest(
                $request->id,
                $request->sender,
                $request->recipient,
                $request->deletionType // add this property to object before deleting
            ));
        });
    }
}
