<?php

namespace App\Enums;

enum RequestType: string
{
    case FRIEND = "friend";
    case CHAT   = "chat";
}
