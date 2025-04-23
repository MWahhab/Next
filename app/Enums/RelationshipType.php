<?php

namespace App\Enums;

enum RelationshipType: string
{
    case FRIENDS = "friends";
    case BLOCKED = "blocked";
}
