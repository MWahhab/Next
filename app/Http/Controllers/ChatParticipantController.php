<?php

namespace App\Http\Controllers;

use App\Http\Requests\HideDMRequest;
use App\Models\ChatParticipant;
use app\Services\ChatParticipantService;
use Illuminate\Http\RedirectResponse;

class ChatParticipantController extends Controller
{
    /**
     * Hides a DM for a user. DM can only be unhidden by manually opening one, or by receiving a message.
     *
     * @param  HideDMRequest          $request
     * @param  ChatParticipantService $service
     * @return RedirectResponse
     */
    public function hideDirectMessage(HideDMRequest $request, ChatParticipantService $service): RedirectResponse
    {
        $validatedRequest = $request->validated();

        $hideData = $service->hideDM($validatedRequest["chatId"]);

        return back()->with($hideData);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ChatParticipant $chatParticipant, ChatParticipantService $service): RedirectResponse
    {
        if(!$chatParticipant->exists){
            abort(404, "Chat Participant Instance not found. Cannot delete.");
        }

        $deletionData = $service->removeParticipant($chatParticipant);

        return back()->with($deletionData);
    }
}
