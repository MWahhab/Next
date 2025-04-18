<?php

namespace App\Http\Controllers;

use App\Enums\RequestType;
use App\Events\NewFriendRequest;
use App\Models\Request as RequestModel;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;

class RequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validatedRequest = $request->validateWithBag('request', [
            'requestType'    => ['required', 'string', new Enum(RequestType::class)],
            'recipientEmail' => ['required', 'string', 'email']
        ]);

        //Rule::exists('users', 'email')->whereNot('id', Auth::id())  REFERENCE FOR FUTURE USE IN SOMETHING WHERE A VALUE HAS TO EXIST IN THE DB OR IT CRASHES

        $sender = User::findOrFail(Auth::id());

        $recipientId = User::where('email', $validatedRequest['recipientEmail'])->value('id');

        if(!$recipientId) {
            return back()->with(
                [
                    'statusCode' => 400,
                    'type'       => "failure",
                    'message'    => "The user doesn't exist!",
                ]
            );
        }

        RequestModel::create(
            [
                'sender_id'    => Auth::id(),
                'recipient_id' => $recipientId,
                'type'         => $validatedRequest['requestType'],
            ]
        );

        broadcast(new NewFriendRequest($sender, $recipientId));

        return back()->with(
            [
                'statusCode' => 201,
                'type'       => "success",
                'message'    => "Friend request sent to {$validatedRequest['recipientEmail']}!",
            ]
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, RequestModel $requestModel)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        //
    }
}
