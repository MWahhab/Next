<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
    protected $fillable = [
        'sender_id',
        'recipient_id',
        'type'
    ];
}
