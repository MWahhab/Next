<?php

namespace App\Enums;

enum MessageType: string
{
    case MESSAGE = "message";
    case IMAGE   = "image";
    case FILE    = "file";
}
