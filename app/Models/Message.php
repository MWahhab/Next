<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int    $chat_id    Refers to the id of the chat
 * @property int    $user_id    Refers to the id of the user who made the message
 * @property string $message    Refers to the text submitted in the message
 * @property string $image_path Refers to the path of an image related to the message
 * @property string $file_path  Refers to the path of the file related to the message
 *
 * @property-read Chat $chat Refers to the data of the chat
 * @property-read User $user Refers to the data of the user who sent the message
 */
class Message extends Model
{
    protected $fillable = [
        'chat_id',
        'user_id',
        'message',
        'image_path',
        'file_path',
    ];

    /**
     * Fetches the data of the chat related to the message
     *
     * @return BelongsTo
     */
    public function chat(): belongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    /**
     * Fetches the data of the user who made the message
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
