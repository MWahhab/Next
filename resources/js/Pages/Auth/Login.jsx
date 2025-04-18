"use client"

import { useEffect } from "react"
import { Head, Link, useForm } from "@inertiajs/react"
import GuestLayout from "@/Layouts/GuestLayout"
import { router } from "@inertiajs/react"

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    })

    useEffect(() => {
        return () => {
            reset("password")
        }
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        router.post(route("login"), data)
    }

    return (
        <GuestLayout>
            <Head title="Log in" />

            <h2 className="text-center text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3 mb-6">Login</h2>

            {status && <div className="mb-4 text-sm font-medium text-green-600">{status}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.email && <div className="mt-1 text-xs text-red-600">{errors.email}</div>}
                </div>

                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        {canResetPassword && (
                            <Link href={route("password.request")} className="text-xs text-blue-600 hover:text-blue-800">
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.password && <div className="mt-1 text-xs text-red-600">{errors.password}</div>}
                </div>

                <div className="flex items-center mb-4">
                    <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData("remember", e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                        Remember me
                    </label>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {processing ? "Logging in..." : "Log in"}
                    </button>
                </div>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Not registered?{" "}
                    <Link href={route("register")} className="font-medium text-blue-600 hover:text-blue-800">
                        Create an account
                    </Link>
                </p>
            </div>
        </GuestLayout>
    )
}
