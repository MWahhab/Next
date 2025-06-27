<?php

namespace App\Rules;

use App\Models\ChatParticipant;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Auth;

class ChatHasUser implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $isUserInChat = ChatParticipant::userInChat(Auth::id(), $value)->exists();

        if(!$isUserInChat) {
            $fail("User isn't a participant in chat");
        }
    }
}
