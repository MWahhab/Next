<?php

namespace App\Enums;

enum UserStatusEnum: string
{
    case ONLINE    = "online";
    case OFFLINE   = "offline";
    case INVISIBLE = "invisible";
}
