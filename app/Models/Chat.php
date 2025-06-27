<?php

namespace App\Models;

use App\Enums\ChatType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * @property int         $id          Refers to the id of the chat record
 * @property string      $name        Refers to the name of the chat
 * @property string|null $description Refers to the description of the chat
 * @property string      $chat_type   Refers to the type of chat that this is
 *
 * @property-read Collection<int, ChatParticipant> $participants Refers to all the participants in a chat
 * @property-read Collection<int, Message>         $messages     Refers to all the messages in a chat
 *
 * @method static directMessageBetween(int $user1Id, int $user2Id) Returns any existing DM chat between two users
 *
 */
class Chat extends Model
{
    protected $fillable = [
        'name',
        'description',
        'chat_type',
    ];

    protected $casts = [
        'chat_type' => ChatType::class,
    ];

    /**
     * Fetches all the chat's participants
     *
     * @return HasMany
     */
    public function participants(): hasMany
    {
        return $this->hasMany(ChatParticipant::class);
    }

    /**
     * Fetches all the chat's messages
     *
     * @return HasMany
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Retrieves query for any existing direct message chat between two users
     *
     * @param  Builder $query   Refers to the query builder
     * @param  int     $user1Id Refers to the id of one of the users in the DM
     * @param  int     $user2Id Refers to the id of the other user in the DM
     * @return Builder          Returns a query of a direct message chat between the two users
     */
    public function scopeDirectMessageBetween(Builder $query, int $user1Id, int $user2Id): Builder
    {
        return $query->where("chat_type", ChatType::DM)
            ->whereHas('participants', function ($q) use ($user1Id, $user2Id) {
                $q->whereIn('user_id', [$user1Id, $user2Id]);
            }, '=', 2)
            ->whereHas('participants', function ($q) use ($user1Id) {
                $q->where('user_id', $user1Id);
            })
            ->whereHas('participants', function ($q) use ($user2Id) {
                $q->where('user_id', $user2Id);
            });
    }

    /**
     * Stores a new chat in the database
     *
     * @param  array    $data     Refers to the data needed to fill in the model fields
     * @param  ChatType $chatType Refers to the type of chat being created
     * @return Chat               Returns the newly created chat instance
     */
    public static function createChat(array $data, ChatType $chatType): Chat
    {
        if ($chatType === ChatType::DM) {
            return self::create([
                'chat_type' => $chatType
            ]);
        }

        return self::create([
            'title'       => $data['title'],
            'description' => $data['description'],
            'chat_type'   => $chatType
        ]);
    }
}
