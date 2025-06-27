<?php

namespace App\Http\Controllers;

use App\Http\Requests\GetChatRequest;
use App\Http\Requests\StoreChatRequest;
use App\Http\Requests\UpdateChatRequest;
use App\Models\Chat;
use App\Services\ChatService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(GetChatRequest $request, ChatService $chatService): Response
    {
        $validatedRequest = $request->validated();

        if(empty($validatedRequest)) {
            abort(400, "Missing chat id");
        }

        //$temp = $validatedRequest->errors();

        $chatData = $chatService->getChatData($validatedRequest);

        return Inertia::render("Chat/Chat", $chatData);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreChatRequest $request, ChatService $chatService): Response
    {
        $validatedRequest = $request->validated();

        if(!isset($validatedRequest['userIds']) | !isset($validatedRequest['title'])) {
            abort(400, "Missing user IDs or title needed for group chat");
        }

        $chat = $chatService
            ->createChat($validatedRequest['userIds'], $validatedRequest['title'], $validatedRequest['description']);

        return Inertia::render("Chat/Chat", $chatService->parseChatInstance($chat));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateChatRequest $request, Chat $chat, ChatService $chatService): RedirectResponse
    {
        if(!$chat->exists) {
            abort(404, "Chat {$chat->id} doesn't exist");
        }

        $validatedRequest = $request->validated();

        if(empty($validatedRequest)) {
            abort(400, "Update was requested without passing any fields to update");
        }

        $updateData = $chatService->updateChat($chat, $validatedRequest["title"], $validatedRequest["description"]);

        return back()->with($updateData);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Chat $chat, ChatService $chatService): RedirectResponse
    {
        if(!$chat->exists) {
            abort(404, "Chat doesn't exist so it cannot be deleted");
        }

        $deletionData = $chatService->deleteChat($chat);

        return back()->with($deletionData);
    }
}
