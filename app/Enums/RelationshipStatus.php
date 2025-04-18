<?php

namespace App\Enums;

enum RelationshipStatus: string
{
    case FRIENDS = "friends";
    case BLOCKED = "blocked";
}
