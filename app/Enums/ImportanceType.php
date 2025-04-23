<?php

namespace App\Enums;

enum ImportanceType: string
{
    case LOW    = "low";
    case MEDIUM = "medium";
    case HIGH   = "high";
}
