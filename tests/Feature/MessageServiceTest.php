<?php

namespace Tests\Feature;

use App\Models\Message;
use app\Services\MessageService;
use Illuminate\Http\UploadedFile;
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
     * Tests to ensure that invalid content provided for parsing for query use, results in the throwing of an exception
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     * @throws \ReflectionException
     */
    public function testInvalidContentForParsing(): void
    {
        $this->expectException(HttpException::class);
        $this->expectExceptionCode(500);
        $this->expectExceptionMessage("Message content not provided for parsing.");

        $service    = $this->app->make(MessageService::class);
        $reflection = new \ReflectionClass($service);

        $parseMessageForQueryMethod = $reflection->getMethod('parseMessageForQuery');

        $parseMessageForQueryMethod->setAccessible(true);

        $invalidContent = [];

        $parseMessageForQueryMethod->invokeArgs($service, [$invalidContent]);
    }

    /**
     * Tests to see the output of a successful message parse
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     * @throws \ReflectionException
     */
    public function testValidContentForParsing(): void
    {
        $service    = $this->app->make(MessageService::class);
        $reflection = new \ReflectionClass($service);

        $parseMessageForQueryMethod = $reflection->getMethod('parseMessageForQuery');

        $parseMessageForQueryMethod->setAccessible(true);

        $imageFile = UploadedFile::fake()->image('avatar.jpg');
        $pdfFile   = UploadedFile::fake()->create('document.pdf', 500);

        $validContent = [
            "message" => "yo",
            "image"   => $imageFile,
            "file"    => $pdfFile,
        ];

        $result = $parseMessageForQueryMethod->invokeArgs($service, [$validContent]);

        $this->assertNotNull($result);
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
        $this->expectExceptionCode(500);
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
        $this->expectExceptionCode(400);
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

    /**
     * Tests to see the output of the updateMessage method when a nonexistent model is passed in. Expects exception
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function testNonExistentMessageModelProvidedForUpdate(): void
    {
        $this->expectException(HttpException::class);
        $this->expectExceptionCode(404);
        $this->expectExceptionMessage("Message instance not found. Cannot update.");

        $nonExistentModel = new Message();
        $validatedRequest = ["message" => "something"];

        $service = $this->app->make(MessageService::class);

        $service->updateMessage($validatedRequest, $nonExistentModel);
    }

    /**
     * Tests to see the output of a successful message update
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function testSuccessfulMessageUpdate(): void
    {
        $model = Message::create([
            "chat_id" => 1,
            "user_id" => 1,
            "message" => "Hello, world!"
        ]);

        $validatedRequest = ["message" => "something else"];

        $service = $this->app->make(MessageService::class);

        $result      = $service->updateMessage($validatedRequest, $model);
        $expectation = ['statusCode' => 200, "type" => "success"];

        $this->assertEquals($expectation, $result);

        $model->delete();
    }

    /**
     * Tests to see output of deletion attempt with nonexistent model. Expects exception
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function testNonExistentModelProvidedForDeletion(): void
    {
        $this->expectException(HttpException::class);
        $this->expectExceptionCode(404);
        $this->expectExceptionMessage("Message instance not found. Cannot delete.");

        $nonExistentModel = new Message();

        $service = $this->app->make(MessageService::class);

        $service->deleteMessage($nonExistentModel);
    }

    /**
     * Tests to see output of successful deletion attempt
     *
     * @return void
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    public function testSuccessfulMessageDeletion(): void
    {
        $model = Message::create([
            "chat_id" => 1,
            "user_id" => 1,
            "message" => "Hello, world!"
        ]);

        $service = $this->app->make(MessageService::class);

        $result      = $service->deleteMessage($model);
        $expectation = ['statusCode' => 204, "type" => "success"];

        $this->assertEquals($expectation, $result);
    }
}
