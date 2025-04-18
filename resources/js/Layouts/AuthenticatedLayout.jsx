"use client"

import { useState } from "react"
import { Bell, Calendar, MessageSquare, Plus, User, Users, FileText, X } from "lucide-react"
import LeftSidebar from "@/Components/LeftSidebar"
import RightSidebar from "@/Components/RightSidebar"

export default function AuthenticatedLayout({ children, auth }) {
    const [view, setView] = useState("schedule") // 'schedule' or 'chat'
    const [showNotifications, setShowNotifications] = useState(false)
    const [notificationRef, setNotificationRef] = useState(null)

    // Close notifications when clicking outside
    const handleClickOutside = (event) => {
        if (notificationRef && !notificationRef.contains(event.target) && showNotifications) {
            setShowNotifications(false)
        }
    }

    // Add event listener when notifications are shown
    if (typeof window !== "undefined" && showNotifications) {
        window.addEventListener("click", handleClickOutside)
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Left Sidebar */}
            <LeftSidebar setView={setView} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">{children}</div>

                {/* Bottom Navigation (Mobile Only) */}
                <div className="md:hidden flex justify-around items-center p-3 bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0">
                    <button
                        onClick={() => setView("schedule")}
                        className={`p-2 rounded-full ${view === "schedule" ? "bg-gray-200" : ""}`}
                    >
                        <Calendar size={24} />
                    </button>
                    <button
                        onClick={() => setView("chat")}
                        className={`p-2 rounded-full ${view === "chat" ? "bg-gray-200" : ""}`}
                    >
                        <MessageSquare size={24} />
                    </button>
                    <button className="p-2 rounded-full">
                        <FileText size={24} />
                    </button>
                    <button className="p-2 rounded-full">
                        <Users size={24} />
                    </button>
                    <button className="p-2 rounded-full">
                        <User size={24} />
                    </button>
                </div>
            </main>

            {/* Right Sidebar */}
            <RightSidebar />

            {/* Notifications Panel */}
            {showNotifications && (
                <div
                    ref={(ref) => setNotificationRef(ref)}
                    className="fixed top-16 right-4 bg-white rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto z-50"
                >
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold">Notifications</h3>
                        <button onClick={() => setShowNotifications(false)}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                            <p className="text-sm">New task created: "Team Meeting"</p>
                            <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                            <p className="text-sm">Task completed: "Submit Report"</p>
                            <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-yellow-500">
                            <p className="text-sm">John accepted your task invitation</p>
                            <p className="text-xs text-gray-500">3 hours ago</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
