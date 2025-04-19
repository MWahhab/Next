<?php

namespace App\Http\Controllers;

use App\Enums\RequestDeletionType;
use App\Http\Requests\DeleteUserRequest;
use App\Http\Requests\StoreUserRequest;
use App\Models\Request as RequestModel;
use App\Services\RequestService;
use Illuminate\Http\Request;

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
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request, RequestService $requestService): \Illuminate\Http\RedirectResponse
    {
        $validatedRequest = $request->validated();

        $recipientRequestData = $requestService->storeRequest($validatedRequest);

        return back()->with(array_merge(
            [
                'statusCode' => 201,
                'type'       => "success",
                'message'    => "Friend request sent to {$validatedRequest['recipientEmail']}!",
            ],
            $recipientRequestData
        ));
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
    public function destroy(DeleteUserRequest $req, RequestModel $request, RequestService $requestService): \Illuminate\Http\RedirectResponse
    {
        if(!$request->exists) {
            abort(404);
        };

        $validatedDeletionType = $req->validated();

        $message =
            $requestService->deleteRequest($request, RequestDeletionType::from($validatedDeletionType["deletionType"]));

        return back()->with([
            'statusCode' => 200,
            'type'       => "success",
            'message'    => $message
        ]);
    }
}
