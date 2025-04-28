"use client"

import { useState } from "react"
import { Calendar, MessageSquare, User, Users, FileText } from "lucide-react"
import LeftSidebar from "@/Components/LeftSidebar"
import { FriendsProvider } from "@/Contexts/FriendsContext"

export default function AuthenticatedLayout({ children, auth }) {
    const [view, setView] = useState("schedule") // 'schedule' or 'chat'

    return (
        <FriendsProvider>
            <div className="flex h-screen bg-gray-100 overflow-hidden">
                {/* Left Sidebar */}
                <LeftSidebar setView={setView} />

                {/* Main Content - Independently Scrollable */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">{children}</div>

                    {/* Bottom Navigation (Mobile Only) */}
                    <div className="md:hidden flex justify-around items-center p-3 bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
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

                {/* Right Sidebar removed */}
            </div>
        </FriendsProvider>
    )
}
