<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewFriendRequest implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var User $sender      References the person who sent the request
     */
    private User $sender;

    /**
     * @var int  $recipientId References the id of the recipient
     */
    private int  $recipientId;

    /**
     * @var int  $requestId   References the id of the request being made
     */
    private int  $requestId;


    /**
     * Create a new event instance.
     */
    public function __construct(User $sender, int $recipientId, int $requestId)
    {
        $this->sender      = $sender;
        $this->recipientId = $recipientId;
        $this->requestId   = $requestId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('friend-requests.' . $this->recipientId),
        ];
    }

    /**
     * Passes values down to listener
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'requestId'  => $this->requestId,
            'senderId'   => $this->sender->id,
            'name'       => $this->sender->name,
            'status'     => $this->sender->status,
            'avatar'     => $this->sender->avatar || null,
            'lastOnline' => $this->sender->status == "online" ? $this->sender->last_online->diffForHumans() : "",
            'email'      => $this->sender->email
        ];
    }

    /**
     * Creates event alias for use by the listener on the frontend (removes need for entire path as parameter)
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'NewFriendRequest';
    }
}
