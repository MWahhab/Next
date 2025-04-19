<?php

namespace App\Services;

use App\Enums\RequestDeletionType;
use App\Models\Request;
use App\Models\Request as RequestModel;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class RequestService
{
    /**
     * Stores new request in DB
     *
     * @param  array $validatedData Refers to the validated HTTP request data
     * @return array
     */
    public function storeRequest(array $validatedData): array
    {
        $sender = User::findOrFail(Auth::id());

        $recipient = User::where('email', $validatedData['recipientEmail'])->first();

        if(!$recipient) {
            return back()->with(
                [
                    'statusCode' => 400,
                    'type'       => "failure",
                    'message'    => "The user doesn't exist!",
                ]
            );
        }

        $friendRequestId = RequestModel::create(
            [
                'sender_id'    => Auth::id(),
                'recipient_id' => $recipient->id,
                'type'         => $validatedData['requestType'],
            ]
        )->id;

        return [
            'requestId'           => $friendRequestId,
            'recipientName'       => $recipient->name,
            'recipientStatus'     => $recipient->status,
            'recipientAvatar'     => $recipient->avatar,
            'recipientLastOnline' => $recipient->last_online,
        ];
    }

    /**
     * Deletes a request
     *
     * @param  Request             $requestModel Refers tp the request that's been made
     * @param  RequestDeletionType $deletionType Refers to whether the request removal was a rejection or cancellation
     * @return string                            Returns a message for the user
     */
    public function deleteRequest(Request $requestModel, RequestDeletionType $deletionType): string
    {
        $requestModel->deletionType = $deletionType->value;

        $requestType = ucfirst($requestModel->type) . ' request';

        $deletionMessage =  $requestModel->deletionType == RequestDeletionType::REJECTION->value ?
            "{$requestType} from {$requestModel->sender->name} rejected!" :
            "{$requestType} to {$requestModel->recipient->name} removed!";

        $requestModel->delete();

        return $deletionMessage;
    }
}
