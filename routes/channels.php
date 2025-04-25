<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('friend-requests.{receiverId}', function ($currentUser, $receiverId) {
    return (int) $currentUser->id === (int) $receiverId;
});

Broadcast::channel("friends.{removedFriendId}", function ($currentUser, $removedFriendId) {
    return (int) $removedFriendId === (int) $currentUser->id;
});
