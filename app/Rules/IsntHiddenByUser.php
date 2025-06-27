<?php

namespace App\Rules;

use App\Models\ChatParticipant;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Auth;

class IsntHiddenByUser implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string, ?string=): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $chatParticipantInstance = ChatParticipant::where(["user_id" => Auth::id(), "chat_id" => $value])->first();

        if($chatParticipantInstance->hidden) {
            $fail("User has already hidden the chat. Cannot rehide.");
        }
    }
}
