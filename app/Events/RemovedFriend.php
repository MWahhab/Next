<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RemovedFriend implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var int $listenerId Refers to the ID of the person that was removed/is listening to the event
     */
    private int $listenerId;

    /**
     * @var int $removerId Refers to the ID of the person who removed the listener as a friend
     */
    private int $removerId;

    /**
     * Create a new event instance.
     */
    public function __construct(int $listenerId, int $removerId)
    {
        $this->listenerId = $listenerId;
        $this->removerId  = $removerId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("friends.{$this->listenerId}"),
        ];
    }

    /**
     * Creates event alias for use by the listener on the frontend (removes need for entire path as parameter)
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'RemovedFriend';
    }

    /**
     * Passes values down to listener
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return ["removerId" => $this->removerId];
    }
}
