"use client"
import { Calendar, MessageSquare, Users, CheckCircle } from "lucide-react"
import CountUp from "../Pages/Auth/Components/CountUp"
import { useState, useEffect } from "react"

export default function GuestLayout({ children }) {
    const [stats, setStats] = useState({
        trackedTasks: 0,
        completedTasks: 0,
        syncedPlans: 0,
        messages: 0,
    })

    useEffect(() => {
        // Simulate loading stats with random numbers
        const interval = setInterval(() => {
            setStats({
                trackedTasks: Math.floor(Math.random() * 1000) + 5000,
                completedTasks: Math.floor(Math.random() * 500) + 2500,
                syncedPlans: Math.floor(Math.random() * 300) + 1200,
                messages: Math.floor(Math.random() * 2000) + 8000,
            })
        }, 5000) // Update every 5 seconds

        // Initial stats
        setStats({
            trackedTasks: 5432,
            completedTasks: 2789,
            syncedPlans: 1345,
            messages: 8721,
        })

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center">
            <div className="sm:mx-auto sm:w-full sm:max-w-5xl">
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column - Description */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 h-full">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                    Streamline Your Day, Amplify Your Productivity
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Welcome to TaskSync, your all-in-one solution for personal and team productivity. Our platform helps
                                    you track tasks, synchronize plans with team members, and facilitate seamless communication—all in one
                                    place. With intuitive scheduling, real-time updates, and smart notifications, you'll never miss a
                                    deadline again.
                                </p>
                                <p className="text-gray-600">
                                    Join thousands of professionals who have transformed their workflow and reclaimed their time. Whether
                                    you're managing personal projects or coordinating with a team, TaskSync adapts to your needs and grows
                                    with you.
                                </p>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center mb-2">
                                            <Calendar className="text-gray-700 mr-2" size={20} />
                                            <h3 className="font-medium text-gray-800">Tracked Tasks</h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <CountUp value={stats.trackedTasks} className="text-2xl font-bold text-gray-800" />
                                            <div className="text-sm text-gray-500">Total</div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500 flex items-center">
                                            <CheckCircle className="text-green-500 mr-1" size={14} />
                                            <CountUp value={stats.completedTasks} className="text-green-600" /> completed
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center mb-2">
                                            <Users className="text-gray-700 mr-2" size={20} />
                                            <h3 className="font-medium text-gray-800">Synchronized Plans</h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <CountUp value={stats.syncedPlans} className="text-2xl font-bold text-gray-800" />
                                            <div className="text-sm text-gray-500">Between People</div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">Seamless team coordination</div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-gray-200 col-span-2">
                                        <div className="flex items-center mb-2">
                                            <MessageSquare className="text-gray-700 mr-2" size={20} />
                                            <h3 className="font-medium text-gray-800">Facilitated Messages</h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <CountUp value={stats.messages} className="text-2xl font-bold text-gray-800" />
                                            <div className="text-sm text-gray-500">And counting</div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">Clear communication drives success</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Form */}
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                            <div className="sm:mx-auto sm:w-full sm:max-w-md">{children}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
