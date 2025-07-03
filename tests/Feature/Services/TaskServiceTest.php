<?php

namespace tests\Feature\Services;

use App\Enums\ImportanceType;
use App\Enums\TaskAssigneeStatus;
use App\Models\Task;
use App\Models\TaskAssignee;
use app\Services\TaskService;
use Carbon\Carbon;
use Database\Factories\UserFactory;
use Tests\TestCase;

class TaskServiceTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    public function test_example(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    /**
     * Tests to see unsuccessful fetchTasks() method execution, when providing an invalid user id
     *
     * @return void
     */
    public function testUnsuccessfulFetchTasksWithInvalidUserId(): void
    {
        $this->expectException(500);
        $this->expectExceptionMessage('Invalid user id provided. Cannot complete task fetch.');

        $service = new TaskService();

        $service->fetchTasks(0);
    }

    /**
     * Tests to see successful output of the fetchTasks() method when no tasks have been assigned
     *
     * @return void
     */
    public function testSuccessfulFetchTasksWithZeroTasksAssigned(): void
    {
        $service = new TaskService();

        $testUser = UserFactory::new()->create();

        $result = $service->fetchTasks($testUser);

        $this->assertEmpty($result);

        $testUser->delete();
    }

    /**
     * Tests to see successful output of the fetchTasks() method when tasks have been assigned
     *
     * @return void
     */
    public function testSuccessfulFetchTasksWithTasksAssigned(): void
    {
        $service = new TaskService();

        $testUser = UserFactory::new()->create();

        $testTask = Task::create([
            "title"       => "some task",
            "description" => "some description",
            "importance"  => ImportanceType::HIGH,
            "due"         => Carbon::now()->startOfWeek(Carbon::MONDAY)->addWeek()->timestamp
        ]);

        //Cascades on actual task deletion, so no need to delete separately
        TaskAssignee::create([
            "task_id"     => $testTask->id,
            "assignee_id" => $testUser->id,
        ]);

        $result = $service->fetchTasks($testUser);

        $this->assertNotEmpty($result);

        $testUser->delete();
        $testTask->delete();
    }

    public function testSuccessfulStoreTask(): void
    {
        //
    }

    public function testSuccessfulUpdateTask(): void
    {
        //
    }

    public function testSuccessfulDeleteTask(): void
    {
        //
    }
}
