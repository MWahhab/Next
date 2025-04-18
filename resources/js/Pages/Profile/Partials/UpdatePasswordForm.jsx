"use client"

import { useRef, useState } from "react"
import { useForm } from "@inertiajs/react"
import { Lock } from "lucide-react"

export default function UpdatePasswordForm({ className = "" }) {
    const passwordInput = useRef()
    const currentPasswordInput = useRef()

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    })

    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

    const updatePassword = (e) => {
        e.preventDefault()

        put(route("password.update"), {
            preserveScroll: true,
            onSuccess: () => {
                reset()
                setShowSuccessMessage(true)
                setTimeout(() => setShowSuccessMessage(false), 2000)
            },
            onError: (errors) => {
                if (errors.password) {
                    reset("password", "password_confirmation")
                    passwordInput.current.focus()
                }

                if (errors.current_password) {
                    reset("current_password")
                    currentPasswordInput.current.focus()
                }
            },
        })
    }

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Update Password</h2>
                <p className="mt-1 text-sm text-gray-600">
                    Ensure your account is using a long, random password to stay secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                        Current Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData("current_password", e.target.value)}
                            type="password"
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="current-password"
                        />
                    </div>
                    {errors.current_password && <div className="mt-1 text-xs text-red-600">{errors.current_password}</div>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        New Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            type="password"
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="new-password"
                        />
                    </div>
                    {errors.password && <div className="mt-1 text-xs text-red-600">{errors.password}</div>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                        Confirm Password
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData("password_confirmation", e.target.value)}
                            type="password"
                            className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={processing}
                    >
                        Save
                    </button>

                    {showSuccessMessage && <p className="text-sm text-green-600">Password updated successfully.</p>}
                </div>
            </form>
        </section>
    )
}
