<?php

namespace app\Services;

use App\Models\Task;
use App\Models\TaskAssignee;

class TaskService
{
    /**
     * Fetches all of the user's tasks
     *
     * @param  int   $userId Refers to the id of the user having their tasks fetched
     * @return array         Refers to a list of tasks, scheduled for completion by the current user
     */
    public function fetchTasks(int $userId): array
    {
        if($userId < 1) {
            abort(500, "Invalid user id provided. Cannot complete task fetch.");
        }

        $tasks = TaskAssignee::tasksForUser($userId)
            ->get()
            ->groupBy(function ($taskAssignee) {
                return $taskAssignee->task->routine ? 'routine' : 'singular';
            })
            ->toArray();

        return $tasks;
    }

    /**
     * Stores a new task
     *
     * @return array
     */
    public function storeTask(): array
    {
        //
    }

    /**
     * Updates a new task
     *
     * @return array
     */
    public function updateTask(): array
    {
        //
    }

    /**
     * Deletes a task
     *
     * @return array
     */
    public function deleteTask(): array
    {
        //
    }

}
