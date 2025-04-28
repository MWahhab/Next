<?php

namespace App\Rules;

use App\Models\FriendRequest;
use App\Models\FriendsList;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Auth;

class ArentFriends implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $areFriends = FriendsList::friendRecord(Auth::id(), $value)->exists();

        if($areFriends) {
            $fail("Cannot send friend request to an existing friend!");
        }
    }
}
