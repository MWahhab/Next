<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserStatusType;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * @property int     $id            Refers to the id of the user
 * @property string  $name          Refers to the name of the user
 * @property string  $email         Refers to the user's email
 * @property string  $password      Refers to the user's password
 * @property boolean $forced_status Refers to whether the user has set a forced status
 * @property string  $status        Refers to the user's current status, e.g: online, offline
 * @property Carbon  $last_online   Refers to a timestamp of when the user was last online
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'forced_status',
        'status',
        'last_online'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_online'       => 'datetime',
            'password'          => 'hashed',
            'status'            => UserStatusType::class
        ];
    }
}
