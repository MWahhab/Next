<?php

namespace App\Events;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AcceptedFriendRequest implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var int $listenerId Refers to the id of the user listening to the event
     */
    private int $listenerId;

    /**
     * @var User $newFriend Refers to the user model of the new friend
     */
    private User $newFriend;

    /**
     * Create a new event instance
     *
     * @param int  $listenerId Refers to the id of the user listening to the request
     * @param User $newFriend  Refers to their new friend's user information
     */
    public function __construct(int $listenerId, User $newFriend)
    {
        $this->listenerId = $listenerId;
        $this->newFriend  = $newFriend;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("friend-requests.{$this->listenerId}"),
        ];
    }

    /**
     * Creates event alias for use by the listener on the frontend (removes need for entire path as parameter)
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return "AcceptedFriendRequest";
    }

    /**
     * Passes values down to listener
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        $newFriend = $this->newFriend->toArray();

        $newFriend["last_online"] = Carbon::create($newFriend["last_online"])->diffForHumans();

        return $newFriend;
    }
}
