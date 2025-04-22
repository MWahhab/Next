<?php

namespace App\Enums;

enum FriendRequestDeletionType: string
{
    case REJECTION    = "rejection";
    case CANCELLATION = "cancellation";
}
