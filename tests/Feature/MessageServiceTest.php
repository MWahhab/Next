<?php

namespace Tests\Feature;

use App\Models\Message;
use app\Services\MessageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class MessageServiceTest extends TestCase
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
     * Tests to see the output of the store method, using an empty array. Expects exception to be thrown
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function testEmptyStoreMessageArray(): void
    {
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('Passed empty message request for storage');

        $service = $this->app->make(MessageService::class);

        $service->storeMessage([]);
    }

    /**
     * Tests to see the output of the store method, when passed incomplete data to work with. Expects exception
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function testInvalidStoreMessageArrayContent(): void
    {
        $this->expectException(HttpException::class);
        $this->expectExceptionMessage('No content passed for message store');

        $service = $this->app->make(MessageService::class);

        $invalidMissingContent = [
            "chatId" => 1
        ];

        $service->storeMessage($invalidMissingContent);
    }

    /**
     * Tests to see the output of a successful message storage
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function testValidStoreMessage(): void
    {
        $service = $this->app->make(MessageService::class);

        $validContent = [
            "chatId"  => 1,
            "message" => "Hello, world!"
        ];

        $service->storeMessage($validContent);

        $this->assertDatabaseHas('messages', $validContent);

        Message::destroy($validContent["chatId"]);
    }
}
