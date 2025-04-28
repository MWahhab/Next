<?php

namespace App\Rules;

use App\Models\FriendsList;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Auth;

class FriendExists implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $friendRecord = FriendsList::friendRecord(Auth::id(), $value)->first();

        if(!$friendRecord){
            $fail("Friend Record nonexistent");
        }
    }
}
