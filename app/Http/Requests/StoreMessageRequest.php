<?php

namespace App\Http\Requests;

use App\Rules\ChatHasUser;
use App\Rules\IsntHiddenByUser;
use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
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
            "chatId"  => [
                "bail",
                "required",
                "integer",
                "exists:chat,id",
                new ChatHasUser(),
            ],
            "message" => [
                "string",
            ],
            "image" => [
                "image",
            ],
            "file" => [
                "file",
            ]
        ];
    }
}
