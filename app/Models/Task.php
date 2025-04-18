<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    protected $fillable = [
        'title',
        'description',
        'importance',
        'completed',
        'due',
        'archived',
        'routine'
    ];

    protected $casts = [
        'routine' => 'array',
    ];

    /**
     * Retrieves all the assignees set to this task
     *
     * @return HasMany
     */
    public function assignees(): hasMany
    {
        return $this->hasMany(Task::class, 'assignee');
    }
}
