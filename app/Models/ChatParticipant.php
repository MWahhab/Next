<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int  $chat_id Refers to the chat's ID
 * @property int  $user_id Refers to the participant's user ID
 * @property bool $hidden  Refers to whether or not the user has opted to hide this chat
 *
 * @property-read $chat        Refers to the chat that the user is in
 * @property-read $participant Refers to the user data of the participant
 *
 * @method static Builder userInChat(int $userId, int $chatId) Refers tp a query of a user in a chat
 */
class ChatParticipant extends Model
{
    protected $fillable = [
        'chat_id',
        'user_id',
        'hidden'
    ];

    /**
     * Fetches the chat data
     *
     * @return BelongsTo
     */
    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class, 'chat_id');
    }

    /**
     * Fetches the participant's user data
     *
     * @return BelongsTo
     */
    public function participant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Queries a user/participant in a chat
     *
     * @param Builder $query  Refers to the query builder
     * @param int     $userId Refers to the id of the user
     * @param int     $chatId Refers to the id of the chat
     * @return Builder
     */
    public function scopeUserInChat(Builder $query, int $userId, int $chatId): Builder
    {
        return $query->where(['user_id' => $userId, 'chat_id', $chatId]);
    }

}
