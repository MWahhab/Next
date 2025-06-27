<?php

namespace app\Services;

use App\Enums\MessageType;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MessageService
{
    /**
     * Stores a new message
     *
     * @param  array $validatedRequest Refers to the validated request data
     * @return array                   Returns an array of store data
     */
    public function storeMessage(array $validatedRequest): array
    {
        if (empty($validatedRequest)) {
            abort(500, "Passed empty message request for storage");
        }

        $messageData = [
            "chat_id" => $validatedRequest["chatId"],
            'user_id' => Auth::id(),
        ];

        $parsedMessageContent = $this->parseMessageForQuery($validatedRequest);

        if(!$parsedMessageContent) {
            abort(400, "No content passed for message store");
        }

        Message::create(array_merge($messageData, $parsedMessageContent));//trigger event for all users in chat

        return ["statusCode" => 201, "type" => "success"];//temp

    }

    /**
     * Updates a message with new content
     *
     * @param  array   $validatedRequest Refers to the validated request data
     * @param  Message $message          Refers to the message instance
     * @return array                     Returns an array of update data
     */
    public function updateMessage(array $validatedRequest, Message $message): array
    {
        if(!$message->exists) {
            abort(404, "Message instance not found. Cannot update.");
        }

        if(empty($validatedRequest)) {
            abort(500, "Passed empty message request for update");
        }

        $parsedMessageContent = $this->parseMessageForQuery($validatedRequest, $message);

        if(!$parsedMessageContent) {
            abort(400, "No new content has been passed for message update.");
        }

        $message->update($parsedMessageContent);//trigger event for all users in chat

        return ['statusCode' => 200, "type" => "success"];
    }

    /**
     * Parses a messages content so it can be used for insert/update queries
     *
     * @param  array        $content Refers to the content being placed into the message table
     * @param  Message|null $message Refers to a message that's being updated
     * @return array|null            Returns an array for parsed data for query use, null for missing data
     */
    private function parseMessageForQuery(array $content, ?Message $message = null): ?array
    {
        if(empty($content)) {
            abort(500, "Message content not provided for parsing.");
        }

        foreach (MessageType::cases() as $typeEnum) {
            $type = $typeEnum->value;

            if(!isset($content[$type])) {
                continue;
            }

            if($type == MessageType::MESSAGE->value) {
                $parsedContent[$type] = $content[$type];

                continue;
            }

            if($message && $message->{$type . "_path"}) {
                Storage::disk("public")->delete($message->{$type . "_path"});
            }

            $filePath = $content[$type]->store("messages/{$type}s", "public");

            $parsedContent[$type . "_path"] = $filePath;
        }

        return $parsedContent ?? null;
    }

    /**
     * Deletes a message
     *
     * @param  Message $message Refers to the message instance
     * @return array            Returns deletion data
     */
    public function deleteMessage(Message $message): array
    {
        if(!$message->exists) {
            abort(404, "Message instance not found. Cannot delete.");
        }

        Storage::disk("public")->delete([
            $message->image_path,
            $message->file_path,
        ]);

        $message->delete();//trigger event for all users in chat

        return ["statusCode" => 204, "type" => "success"];

    }

}
