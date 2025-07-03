<?php

namespace App\Models;

use App\Enums\TaskAssigneeStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int    $task_id     Refers to the id of the task
 * @property int    $assignee_id Refers to the id of the assignee
 * @property string $status      Refers to the status of the assignment, e.g: confirmed, rejected, pending
 *
 * @property-read Task $task Refers to the task associated with the assignment
 *
 * @method static Builder TasksForUser(int $userId) Retrieves a query of all the tasks assigned to a user
 */
class TaskAssignee extends Model
{
    protected $fillable = [
        'task_id',
        'assignee_id',
        'status',
    ];

    protected $casts = [
        "status" => TaskAssigneeStatus::class
    ];

    /**
     * Retrieves the task related to the assignment
     *
     * @return BelongsTo
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    /**
     * Returns a query of all of a user's tasks
     *
     * @param  Builder $query  Refers to the query builder
     * @param  int     $userId Refers to the id of the user
     * @return Builder         Returns a query of tasks related to the user
     */
    public function scopeTasksForUser(Builder $query, int $userId): Builder
    {
        return $query->with("task")->where('assignee_id', $userId);
    }
}
