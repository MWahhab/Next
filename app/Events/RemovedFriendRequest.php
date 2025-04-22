<?php

namespace App\Events;

use App\Enums\FriendRequestDeletionType as DeletionTypeEnum;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RemovedFriendRequest implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var DeletionTypeEnum  $deletionType Refers to whether the request deletion was a rejection or cancellation
     */
    private DeletionTypeEnum  $deletionType;

    /**
     * @var int               $senderId     Refers to the id of the sender of the request
     */
    private int               $senderId;

    /**
     * @var User              $recipient    Refers to the request recipient
     */
    private User              $recipient;

    /**
     * Create a new Event instance
     *
     * @param int              $senderId     Refers to the person who sent the request
     * @param User             $recipient    Refers to the person who received the request
     * @param DeletionTypeEnum $deletionType Refers to whether the removal was a rejection or a cancellation
     */
    public function __construct(int $senderId, User $recipient, DeletionTypeEnum $deletionType)
    {
        $this->senderId     = $senderId;
        $this->recipient    = $recipient;
        $this->deletionType = $deletionType;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $userListeningId =
            $this->deletionType == DeletionTypeEnum::REJECTION ? $this->senderId : $this->recipient->id;

        return [
            new PrivateChannel("friend-requests." . $userListeningId),
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return "RemovedFriendRequest";
    }

    /**
     * Passes values down to listener
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        $broadcastData = ["deletionType" => $this->deletionType->value];

        if($this->deletionType == DeletionTypeEnum::REJECTION) {
            $broadcastData["recipientId"]   = $this->recipient->id;
            $broadcastData["recipientName"] = $this->recipient->name;

            return $broadcastData;
        }

        $broadcastData["senderId"] = $this->senderId;

        return $broadcastData;
    }
}
