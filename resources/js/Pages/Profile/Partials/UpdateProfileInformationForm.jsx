"use client"

import { useState } from "react"
import { Link, useForm, usePage } from "@inertiajs/react"
import { User, Mail, Camera } from "lucide-react"

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = "" }) {
    const user = usePage().props.auth.user

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    })

    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

    const submit = (e) => {
        e.preventDefault()

        patch(route("profile.update"), {
            onSuccess: () => {
                setShowSuccessMessage(true)
                setTimeout(() => setShowSuccessMessage(false), 2000)
            },
        })
    }

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-600">Update your account's profile information and email address.</p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <div className="mb-6">
                        <div className="flex items-center">
                            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                                <User size={32} className="text-gray-500" />
                            </div>
                            <button type="button" className="px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                                <Camera size={16} className="inline mr-1" /> Change Photo
                            </button>
                        </div>
                    </div>

                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {errors.name && <div className="mt-1 text-xs text-red-600">{errors.name}</div>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email}</div>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm mt-2 text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route("verification.send")}
                                method="post"
                                as="button"
                                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === "verification-link-sent" && (
                            <div className="mt-2 font-medium text-sm text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={processing}
                    >
                        Save
                    </button>

                    {showSuccessMessage && <p className="text-sm text-green-600">Profile information updated successfully.</p>}
                </div>
            </form>
        </section>
    )
}
