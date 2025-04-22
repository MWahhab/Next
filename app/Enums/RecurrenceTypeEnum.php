<?php

namespace App\Enums;

enum RecurrenceTypeEnum: string
{
    case INCREMENTAL = "incremental";
    case DAILY       = "daily";
    case WEEKLY      = "weekly";
    case MONTHLY     = "monthly";
}
