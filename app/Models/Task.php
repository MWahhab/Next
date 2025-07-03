<?php

namespace App\Models;

use App\Enums\ImportanceType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string  $title       Refers to the title of the task
 * @property string  $description Refers to the task's description
 * @property string  $importance  Refers to the task's importance
 * @property boolean $completed   Refers to whether or not a task has been completed
 * @property string  $due         Refers to a timestamp which tracks when the task is due
 * @property boolean $archived    Refers to whether or not the task has been archived
 * @property array   $routine     Refers to an array containing routine data - e.g: what days a task is set for repeat
 *
 * @property-read TaskAssignee $assignees Refers to the assignee records for this task
 */
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
        'routine'    => 'array',
        "importance" => ImportanceType::class,
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
