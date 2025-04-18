"use client"

import { useState } from "react"
import { Head } from "@inertiajs/react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import DeleteUserForm from "./Partials/DeleteUserForm"
import UpdatePasswordForm from "./Partials/UpdatePasswordForm"
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm"
import { User, Lock, Trash2, Bell, Clock, Calendar, CheckCircle, ArrowLeft } from "lucide-react"

export default function Edit({ auth, mustVerifyEmail, status }) {
    const [activeTab, setActiveTab] = useState("profile")

    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "password", label: "Password", icon: Lock },
        { id: "delete", label: "Delete Account", icon: Trash2 },
    ]

    const userStats = {
        tasksCreated: 87,
        tasksCompleted: 64,
        messagesExchanged: 152,
        plansCoordinated: 23,
    }

    const handleGoBack = () => {
        window.history.back()
    }

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="Profile" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Back Button */}
                    <button onClick={handleGoBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft size={16} className="mr-1" />
                        <span>Back</span>
                    </button>

                    <div className="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Sidebar */}
                            <div className="md:col-span-1">
                                <div className="space-y-6">
                                    {/* User Card */}
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex flex-col items-center">
                                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                                <User size={40} className="text-gray-500" />
                                            </div>
                                            <h2 className="text-xl font-semibold text-gray-800">{auth.user.name}</h2>
                                            <p className="text-gray-500 text-sm">{auth.user.email}</p>
                                            <div className="mt-2 text-xs text-gray-500">Member since {new Date().toLocaleDateString()}</div>
                                        </div>
                                    </div>

                                    {/* Navigation */}
                                    <nav className="space-y-1">
                                        {tabs.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                                    activeTab === tab.id
                                                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500"
                                                        : "text-gray-700 hover:bg-gray-50"
                                                }`}
                                            >
                                                <tab.icon
                                                    className={`mr-3 h-5 w-5 ${activeTab === tab.id ? "text-blue-500" : "text-gray-400"}`}
                                                />
                                                {tab.label}
                                            </button>
                                        ))}
                                    </nav>

                                    {/* Stats */}
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <h3 className="font-medium text-gray-700 mb-3">Your Activity</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar size={16} className="mr-2 text-gray-400" />
                                                    Tasks Created
                                                </div>
                                                <span className="font-medium">{userStats.tasksCreated}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <CheckCircle size={16} className="mr-2 text-gray-400" />
                                                    Tasks Completed
                                                </div>
                                                <span className="font-medium">{userStats.tasksCompleted}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Bell size={16} className="mr-2 text-gray-400" />
                                                    Messages Exchanged
                                                </div>
                                                <span className="font-medium">{userStats.messagesExchanged}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Clock size={16} className="mr-2 text-gray-400" />
                                                    Plans Coordinated
                                                </div>
                                                <span className="font-medium">{userStats.plansCoordinated}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="md:col-span-3">
                                {activeTab === "profile" && (
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                        className="max-w-xl"
                                    />
                                )}

                                {activeTab === "password" && <UpdatePasswordForm className="max-w-xl" />}

                                {activeTab === "delete" && <DeleteUserForm className="max-w-xl" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    )
}
