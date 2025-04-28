<?php

namespace App\Rules;

use App\Models\BlockedList;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Auth;

class IsntBlocked implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $blockExists = BlockedList::blockRecord($value, Auth::id())->exists();

        if($blockExists) {
            $fail("User has already blocked you!");
        }
    }
}
