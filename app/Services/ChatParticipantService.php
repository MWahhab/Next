<?php

namespace app\Services;

use App\Models\ChatParticipant;
use Illuminate\Support\Facades\Auth;

class ChatParticipantService
{
    /**
     * Hides a chat from a user
     *
     * @param int $chatId Refers to the id of the chat
     * @return array         Returns an array of data related to the attempt to hide the chat
     */
    public function hideDM(int $chatId): array
    {
        $chat = ChatParticipant::where(["chat_id" => $chatId, "user_id" => Auth::id()])->firstOrFail();

        $chat->update(["hidden" => true]);

        return array_merge([
            "statusCode" => 200,
            "type" => "success",
        ]);
    }

    /**
     * Removes a chat participant
     *
     * @param  ChatParticipant $chatParticipant Refers to the chat participant instance
     * @return array                            Returns an array of deletion data
     */
    public function removeParticipant(ChatParticipant $chatParticipant): array
    {
        if(!$chatParticipant->exists){
            abort(500, "Invalid chat participant instance provided to parser");
        }

        $chatParticipant->delete();//trigger event for all users in chat

        return ["statusCode" => 200, "type" => "success"];
    }

}
