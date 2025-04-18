<?php

namespace App\Enums;

enum TypeOfRecurrence: string
{
    case INCREMENTAL = "incremental";
    case DAILY       = "daily";
    case WEEKLY      = "weekly";
    case MONTHLY     = "monthly";
}
