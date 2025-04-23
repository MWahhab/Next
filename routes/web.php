<?php

use App\Http\Controllers\ChatController;
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

    Route::get('/mockChat', function () { return Inertia::render('Chat/Chat'); });


    Route::resource('/chat', ChatController::class);
    Route::resource('/message', MessageController::class);
    Route::resource('/relationship', RelationshipController::class);
    Route::resource('/task_assignee', TaskAssigneeController::class);
    Route::resource('/task', TaskController::class);

    Route::post('/friend-request', [FriendRequestController::class, 'store'])->name('friend-request.store');
    Route::delete('/friend-request/{sender}/{recipient}', [FriendRequestController::class, 'destroy'])
        ->name('friend-request.destroy');

    Route::post('/relationship/{otherUser}', [RelationshipController::class, 'store'])
        ->name('relationship.store');
});

require __DIR__.'/auth.php';
