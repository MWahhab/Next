<?php

namespace App\Enums;

enum UserStatusType: string
{
    case ONLINE    = "online";
    case OFFLINE   = "offline";
    case INVISIBLE = "invisible";
}
