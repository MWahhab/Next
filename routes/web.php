<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\ChatParticipantController;
use App\Http\Controllers\FriendsListController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RelationshipController;
use App\Http\Controllers\FriendRequestController;
use App\Http\Controllers\TaskAssigneeController;
use App\Http\Controllers\TaskController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Auth/Login', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

Route::get('/schedule', function () {
    return Inertia::render('Schedule/Schedule');
})->middleware(['auth', 'verified'])->name('schedule');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::resource('/chat', ChatController::class);
    Route::resource('/message', MessageController::class);
    Route::resource('/friends-list', FriendsListController::class)->only("index");
    Route::resource('/task-assignee', TaskAssigneeController::class);
    Route::resource('/task', TaskController::class);

    Route::put("/hide-dm", [ChatParticipantController::class, "hideDirectMessage"])->name("chat.hideDM");

    Route::post('/friend-request', [FriendRequestController::class, 'store'])->name('friend-request.store');
    Route::delete('/friend-request/{sender}/{recipient}', [FriendRequestController::class, 'destroy'])
        ->name('friend-request.destroy');

    Route::post("/friends-list", [FriendsListController::class, 'store'])->name('friends-list.store');
    Route::delete("/friends-list", [FriendsListController::class, 'destroy'])->name('friends-list.destroy');

    Route::post("/blocked-list", [FriendsListController::class, 'store'])->name('blocked-list.store');
    Route::delete("/blocked-list", [FriendsListController::class, 'destroy'])->name('blocked-list.destroy');
});

require __DIR__.'/auth.php';
