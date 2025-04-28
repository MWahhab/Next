<?php

namespace App\Http\Controllers;

use App\Http\Requests\RemoveBlockRequest;
use App\Http\Requests\StoreBlockRequest;
use App\Services\BlockedListService;
use Illuminate\Http\RedirectResponse;

class BlockedListController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBlockRequest $request, BlockedListService $blockedListService): RedirectResponse
    {
        $validatedRequest = $request->validated();

        $response = $blockedListService->storeBlock($validatedRequest["blockedId"]);

        return back()->with($response);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(RemoveBlockRequest $blockedList, BlockedListService $blockedListService): RedirectResponse
    {
        $validatedRequest = $blockedList->validated();

        $response = $blockedListService->removeBlock($validatedRequest["blockedId"]);

        return back()->with($response);
    }
}
