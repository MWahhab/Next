<?php

namespace App\Http\Requests;

use App\Enums\FriendRequestDeletionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class RemoveFriendRequestRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "deletionType" => [
                "bail",
                "required",
                "string",
                new enum(FriendRequestDeletionType::class),
            ]
        ];
    }
}
