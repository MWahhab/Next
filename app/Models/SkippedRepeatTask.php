<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SkippedRepeatTask extends Model
{
    protected $fillable = [
        'task_id',
        'user_id',
        'dates'
    ];

    protected $casts = [
        'dates' => 'array'
    ];
}
