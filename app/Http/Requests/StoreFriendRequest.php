<?php

namespace App\Http\Requests;

use App\Rules\ArentFriends;
use App\Rules\HasntBlockedUser;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreFriendRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            "friendId" => [
                "bail",
                "required",
                "integer",
                "exists:users,id",
                new ArentFriends(),
                new HasntBlockedUser()
            ],
        ];
    }
}
