<?php

namespace App\Enums;

enum FriendRequestDeletionTypeEnum: string
{
    case REJECTION    = "rejection";
    case CANCELLATION = "cancellation";
}
