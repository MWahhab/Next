<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewFriendRequest implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public User $sender;
    public int $recipientId;

    /**
     * Create a new event instance.
     */
    public function __construct(User $sender, int $recipientId)
    {
        $this->sender      = $sender;
        $this->recipientId = $recipientId;
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

    public function broadcastWith(): array
    {
        return [
            'name'       => $this->sender->name,
            'status'     => $this->sender->status,
            'avatar'     => $this->sender->avatar || null,
            'lastOnline' => $this->sender->status == "online" ? "" : $this->sender->last_online->diffForHumans(),
            'email'      => $this->sender->email
        ];
    }

    public function broadcastAs(): string
    {
        return 'NewFriendRequest';
    }
}
