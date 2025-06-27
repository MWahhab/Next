<?php

namespace app\Services;

use App\Enums\ChatType;
use App\Models\Chat;
use App\Models\ChatParticipant;
use Illuminate\Support\Facades\Auth;

class ChatService
{
    /**
     * Retrieves an existing chat - or creates a new one if one doesn't exist already. Assumes user WANTS to view chat.
     *
     * @param  array $validatedRequest Refers to the pre-validated request data
     * @return array                   Returns an array of chat data
     */
    public function getChatData(array $validatedRequest): array
    {
        if(empty($validatedRequest)) {
            abort(400, "Missing ID needed to retrieve chat data");
        }

        if($validatedRequest["otherChatterId"]) {
            $chat = Chat::directMessageBetween(Auth::id(), $validatedRequest["otherChatterId"])->first();

            if(!$chat){
                $chat = $this->createChat([$validatedRequest["otherChatterId"], Auth::id()]);
            }
        }

        $chat = $chat ?? Chat::findOrfail($validatedRequest["chatId"]);

        return $this->parseChatInstance($chat);
    }

    /**
     * Creates a new chat
     *
     * @param  array    $userIds     Refers to the IDs of the users participating in the chat
     * @param  string   $title       Refers to the title of the chat
     * @param  string   $description Refers to the chat description
     * @return Chat                  Returns instance of newly created chat
     */
    public function createChat(array $userIds, string $title = "", string $description = ""): Chat
    {
        if(empty($userIds) || count($userIds) < 2) {
            abort(400, "Missing participants IDs that are needed to create chat");
        }

        $chatType = count($userIds) == 2 ? ChatType::DM : ChatType::GROUP;

        if($chatType == ChatType::GROUP && !$title) {
            abort(400, "Attempted to create group chat without a title!");
        }

        $newChat = Chat::createChat(["title" => $title, "description" => $description], $chatType);

        $newChat->participants()->createMany(
            collect($userIds)->map(fn($userId) => ['user_id' => $userId])->toArray()
        );//trigger event for all users in chat

        return $newChat;
    }

    /**
     * Retrieves the chat's title/description, messages and participants from a chat instance.
     *
     * @param  Chat  $chat Refers to the chat instance being parsed
     * @return array       Refers to an array consisting of chat data, messages and participants
     */
    public function parseChatInstance(Chat $chat): array
    {
        if(!$chat->exists) {
            abort(500, "Invalid chat instance provided to parser");
        }

        $participants = $chat->participants->sortByDesc("created_at")
            ->map(function ($participant) {
                /**
                 * @var ChatParticipant $participant
                 */
                if($participant->user_id == Auth::id() && $participant->hidden) {
                    $participant->update(["hidden" => false]);
                }

                $participant->participant->toArray();
            })
            ->toArray();

        return [
            "chat"         => $chat->toArray(),
            "messages"     => $chat->messages->sortByDesc("created_at")->toArray(),
            "participants" => $participants
        ];
    }

    /**
     * Updates a chat
     *
     * @param  Chat   $chat           Refers to a chat instance
     * @param  string $newTitle       Refers to a new title
     * @param  string $newDescription Refers to a new description
     * @return array
     */
    public function updateChat(Chat $chat, string $newTitle = "", string $newDescription = ""): array
    {
        if(!$chat->exists) {
            abort(500, "Invalid chat instance provided for update attempt");
        }

        if(!$newTitle && !$newDescription) {
            abort(400, "Neither a new title or description was provided to update chat data");
        }

        if($newTitle) {
            $columnsToUpdate["title"] = $newTitle;
        }

        if($newDescription) {
            $columnsToUpdate["description"] = $newDescription;
        }

        $chat->update($columnsToUpdate);//trigger event for all users in chat

        return [
            "statusCode" => 204,
            "type"       => "success",
        ];
    }

    /**
     * Deletes a chat instance
     *
     * @param  Chat  $chat Refers to the chat instance
     * @return array       Returns an array containing deletion data
     */
    public function deleteChat(Chat $chat): array
    {
        if(!$chat->exists) {
            abort(404, "Chat doesn't exist so it cannot be deleted");
        }

        $chatName = $chat->name;

        $chat->delete();//trigger event for all users in chat

        return array_merge([
            "statusCode"  => 200,
            "type"        => "success",
            "message"     => __("chat.deleted", ["name" => $chatName])
        ]);
    }

}
