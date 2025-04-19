<?php

namespace App\Enums;

enum RequestDeletionType: string
{
    case REJECTION    = "rejection";
    case CANCELLATION = "cancellation";
}
