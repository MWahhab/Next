"use client"

import { useState } from "react"
import { Search, Users, User, FileText, LogOut, Home } from "lucide-react"
import { usePage, Link } from "@inertiajs/react"

export default function LeftSidebar({ setView }) {
    const { url } = usePage()
    const [searchTerm, setSearchTerm] = useState("")
    const [chats, setChats] = useState([
        { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", unread: 2 },
        { id: 2, name: "Team Alpha", lastMessage: "Meeting at 3pm", unread: 0, isGroup: true },
        { id: 3, name: "Sarah Wilson", lastMessage: "I finished the task", unread: 1 },
        { id: 4, name: "Project X", lastMessage: "New updates available", unread: 3, isGroup: true },
        { id: 5, name: "Mike Johnson", lastMessage: "Let me know when you're free", unread: 0 },
        { id: 6, name: "Design Team", lastMessage: "Check the new mockups", unread: 0, isGroup: true },
        { id: 7, name: "Lisa Brown", lastMessage: "Thanks for your help!", unread: 0 },
        { id: 8, name: "Marketing", lastMessage: "Campaign starts tomorrow", unread: 5, isGroup: true },
        { id: 9, name: "Alex Smith", lastMessage: "Can we talk later?", unread: 0 },
        { id: 10, name: "Development", lastMessage: "New bug reported", unread: 2, isGroup: true },
    ])

    const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Check if we're on the chat page and extract the chat ID from the URL
    const isChatPage = url.startsWith("/chat")
    const activeChatId = isChatPage ? Number.parseInt(url.split("/").pop()) : null

    const handleChatClick = (chatId) => {
        //window.location.href = `/chat/${chatId}`
        window.location.href = "/mockChat";
    }

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full hidden md:flex">
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Find..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
                <p className="text-xs text-gray-500 mt-1">Search for chats with specific users</p>
            </div>

            {/* Chat List - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {filteredChats.map((chat) => (
                    <div
                        key={chat.id}
                        className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                            activeChatId === chat.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleChatClick(chat.id)}
                    >
                        <div className="flex items-center">
                            <div className="relative">
                                {chat.isGroup ? (
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Users size={20} className="text-blue-600" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User size={20} className="text-gray-600" />
                                    </div>
                                )}
                                {chat.unread > 0 && (
                                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {chat.unread}
                                    </div>
                                )}
                            </div>
                            <div className="ml-3 flex-1">
                                <div className="flex justify-between">
                                    <span className={`font-medium ${activeChatId === chat.id ? "text-blue-600" : ""}`}>{chat.name}</span>
                                    <span className="text-xs text-gray-500">12:30 PM</span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Navigation - Fixed Position */}
            <div className="p-3 border-t border-gray-200 flex justify-around bg-white flex-shrink-0">
                <Link
                    href={route("schedule")}
                    className={`p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:scale-105 transition-all`}
                    title="Home"
                >
                    <Home size={20} />
                </Link>
                <button className="p-2 hover:bg-gray-100 rounded-full" title="Archived Tasks">
                    <FileText size={20} />
                </button>
                <Link href={route('relationship.index')} className="p-2 hover:bg-gray-100 rounded-full" title="Friends List">
                    <Users size={20} />
                </Link>
                <Link href={route("profile.edit")} className="p-2 hover:bg-gray-100 rounded-full" title="Profile">
                    <User size={20} />
                </Link>
                <Link method="post" href={route("logout")} className="p-2 hover:bg-gray-100 rounded-full" title="Logout">
                    <LogOut size={20} />
                </Link>
            </div>
        </div>
    )
}
