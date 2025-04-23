<?php

namespace App\Enums;

enum TaskRecurrenceType: string
{
    case INCREMENTAL = "incremental";
    case DAILY       = "daily";
    case WEEKLY      = "weekly";
    case MONTHLY     = "monthly";
}
