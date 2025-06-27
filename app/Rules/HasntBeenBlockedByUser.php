<?php

namespace App\Rules;

use App\Models\BlockedList;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Translation\PotentiallyTranslatedString;

class HasntBeenBlockedByUser implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $hasBeenBlocked = BlockedList::blockRecord(Auth::id(), $value)->exists();

        if ($hasBeenBlocked) {
            $fail("Other user is blocked");
        }
    }
}
