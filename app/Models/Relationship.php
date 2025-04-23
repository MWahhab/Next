<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int         $id         Refers to the id of the relationship record
 * @property int         $user_1_id  Refers to the id of user 1
 * @property int         $user_3_id  Refers to the id of user 2
 * @property string      $status     Refers to the relationship status between the two users
 * @property Carbon|null $created_at Refers to when the relationship was created
 * @property Carbon|null $updated_at Refers to when the relationship was last updated
 *
 * @property-read User $user1 Refers to the User data of User1
 * @property-read User $user2 Refers to the User data of User2
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
}
