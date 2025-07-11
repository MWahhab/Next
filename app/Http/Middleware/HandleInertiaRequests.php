<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth'          => [
                'user' => $request->user(),
            ],
            'notification'  => fn () => [
                'statusCode' => $request->session()->get('statusCode'),
                'type'       => $request->session()->get('type'),
                'message'    => $request->session()->get('message'),
            ],
            'friendRequest' => fn () => [
                'id'          => $request->session()->get('id'),
                'name'        => $request->session()->get('name'),
                'email'       => $request->session()->get('email'),
                'status'      => $request->session()->get('status'),
                'avatar'      => $request->session()->get('avatar'),
                'last_online' => $request->session()->get('last_online'),
            ],
            'friend'        => fn () => [
                'id'          => $request->session()->get('id'),
                'name'        => $request->session()->get('name'),
                'email'       => $request->session()->get('email'),
                'status'      => $request->session()->get('status'),
                'avatar'      => $request->session()->get('avatar'),
                'last_online' => $request->session()->get('last_online'),
            ]
        ];
    }
}
