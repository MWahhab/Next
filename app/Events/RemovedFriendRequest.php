<?php

namespace App\Events;

use App\Enums\RequestDeletionType;
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
     * @var int         $requestId     Refers to the id of the request being made
     */
    private int     $requestId;

    /**
     * @var string  $deletionType      Refers to whether the request deletion was caused by a rejection or cancellation
     */
    private string  $deletionType;

    /**
     * @var int         $userId        Refers to the id of the user listening to the event
     */
    private int     $userId;

    /**
     * @var string|null $recipientName Refers to the name of the request recipient
     */
    private ?string $recipientName;

    /**
     * Create a new Event instance
     *
     * @param int    $requestId    Refers to the id of the request being made
     * @param User   $sender       Refers to the person who sent the request
     * @param User   $recipient    Refers to the person who received the request
     * @param string $deletionType Refers to whether the removal was a rejection or a cancellation
     */
    public function __construct(int $requestId, User $sender, User $recipient, string $deletionType)
    {
        $this->requestId    = $requestId;
        $this->deletionType = $deletionType;

        if($deletionType == RequestDeletionType::REJECTION->value) {
            $this->userId        = $sender->id;
            $this->recipientName = $recipient->name;

            return;
        }

        $this->userId = $recipient->id;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("friend-requests.{$this->userId}"),
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
        $broadcastData = ["requestId" => $this->requestId, "deletionType" => $this->deletionType];

        isset($this->recipientName) && $broadcastData["recipientName"] = $this->recipientName;

        return $broadcastData;
    }
}
