<?php

namespace tests\Feature\Services;

use App\Models\ChatParticipant;
use app\Services\ChatParticipantService;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class ChatParticipantServiceTest extends TestCase
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
     * Tests to see the output of the hideDM() method when an invalid chat ID is provided. Expects an exception.
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function testHideDMWithInvalidChatId(): void
    {
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage("Chat ID must be greater than 0.");

        $service = $this->app->make(ChatParticipantService::class);

        $service->hideDM(0);
    }

    /**
     * Tests to see output of a valid hideDM() method execution
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function testValidHideDM(): void
    {
        $service = $this->app->make(ChatParticipantService::class);

        $testChat = ChatParticipant::create([
            "chat_id" => "1",
            "user_id" => "1"
        ]);

        $result      = $service->hideDM($testChat->id);
        $expectation = [
            "statusCode" => 200,
            "type"       => "success",
        ];

        $this->assertEquals($result, $expectation);

        $testChat->delete();
    }

    /**
     * Tests to see output of removeParticipant() method with nonexistent model. Expects exception
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function testRemoveParticipantWithNonExistingChatParticipant(): void
    {
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage("Invalid chat participant instance provided to parser");

        $service = $this->app->make(ChatParticipantService::class);

        $nonExistentModel = new ChatParticipant();

        $service->removeParticipant($nonExistentModel);
    }

    /**
     * Tests output of valid removeParticipant() method execution
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function testValidRemoveParticipant(): void
    {
        $service = $this->app->make(ChatParticipantService::class);

        $testChat = ChatParticipant::create([
            "chat_id" => "1",
            "user_id" => "1"
        ]);

        $result      = $service->removeParticipant($testChat);
        $expectation = [
            "statusCode" => 200,
            "type"       => "success"
        ];

        $this->assertEquals($result, $expectation);
    }
}
