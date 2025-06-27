<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageRequest;
use App\Http\Requests\UpdateMessageRequest;
use App\Models\Message;
use app\Services\MessageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMessageRequest $request, MessageService $messageService): RedirectResponse
    {
        $validatedReq = $request->validated();

        $storeData = $messageService->storeMessage($validatedReq);

        return back()->with($storeData);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMessageRequest $request, Message $message, MessageService $messageService): RedirectResponse
    {
        if(!$message->exists) {
            abort(404, "Message instance not found. Cannot update.");
        }

        $validatedReq = $request->validated();

        $updateData = $messageService->updateMessage($validatedReq, $message);

        return back()->with($updateData);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message, MessageService $messageService): RedirectResponse
    {
        if(!$message->exists) {
            abort(404, "Message instance not found. Cannot delete.");
        }

        $deletionData = $messageService->deleteMessage($message);

        return back()->with($deletionData);
    }
}
