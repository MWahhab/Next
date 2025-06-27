"use client"

import { useState, useEffect } from "react"
import { Search, Users, User, FileText, LogOut, Home, MessageSquare, X } from 'lucide-react'
import { usePage } from "@inertiajs/react"
import { Link, router } from "@inertiajs/react"
import { useFriends } from "@/Contexts/FriendsContext"
import UserProfileCard from "@/Components/UserProfileCard"
import CreateChatModal from "@/Components/CreateChatModal"
import ConfirmationModal from "@/Components/ConfirmationModal"

export default function LeftSidebar({ setView, activeChat }) {
    const { url } = usePage()
    const [searchTerm, setSearchTerm] = useState("")
    const { sortedFriends } = useFriends() // Get friends from context
    const [selectedUser, setSelectedUser] = useState(null)
    const [showProfileCard, setShowProfileCard] = useState(false)
    const [showCreateChatModal, setShowCreateChatModal] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [confirmationData, setConfirmationData] = useState({
        title: "",
        message: "",
        action: null,
    })
    const [hoveredChat, setHoveredChat] = useState(null)

    // Chats will come from API in the future
    const [chats, setChats] = useState([
        { id: 1, name: "John Doe", lastMessage: "Hey, how are you?", unread: 2, isGroup: false },
        { id: 2, name: "Team Alpha", lastMessage: "Meeting at 3pm", unread: 0, isGroup: true },
        { id: 3, name: "Sarah Wilson", lastMessage: "I finished the task", unread: 1, isGroup: false },
        { id: 4, name: "Project X", lastMessage: "New updates available", unread: 3, isGroup: true },
        { id: 5, name: "Mike Johnson", lastMessage: "Let me know when you're free", unread: 0, isGroup: false },
        { id: 6, name: "Design Team", lastMessage: "Check the new mockups", unread: 0, isGroup: true },
        { id: 7, name: "Lisa Brown", lastMessage: "Thanks for your help!", unread: 0, isGroup: false },
        { id: 8, name: "Marketing", lastMessage: "Campaign starts tomorrow", unread: 5, isGroup: true },
        { id: 9, name: "Alex Smith", lastMessage: "Can we talk later?", unread: 0, isGroup: false },
        { id: 10, name: "Development", lastMessage: "New bug reported", unread: 2, isGroup: true },
    ])

    // Effect to update chats when activeChat changes
    useEffect(() => {
        if (activeChat && !chats.some((chat) => chat.id === activeChat.id)) {
            // Add the active chat to the top of the list
            setChats([
                {
                    id: activeChat.id,
                    name: activeChat.name,
                    lastMessage: "Started a conversation",
                    unread: 0,
                    isGroup: activeChat.isGroup,
                },
                ...chats,
            ])
        }
    }, [activeChat])

    const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Check if we're on the chat page and extract the chat ID from the URL
    const isChatPage = url.startsWith("/chat")
    const activeChatId = activeChat ? activeChat.id : isChatPage ? Number.parseInt(url.split("/").pop()) : null

    const handleChatClick = (chatId) => {
        window.location.href = `/chat/${chatId}`
    }

    const handleProfileClick = (e, chat) => {
        e.stopPropagation() // Prevent triggering the chat click

        if (chat.isGroup) return // Don't open profile card for group chats

        // Find the corresponding user in friends list
        const user = sortedFriends.find((friend) => friend.name === chat.name)
        if (user) {
            setSelectedUser(user)
            setShowProfileCard(true)
        }
    }

    const handleCloseChat = (e, chat) => {
        e.stopPropagation() // Prevent triggering the chat click

        setConfirmationData({
            title: chat.isGroup ? "Leave Group Chat" : "Close Conversation",
            message: chat.isGroup
                ? `Are you sure you want to leave the "${chat.name}" group?`
                : `Are you sure you want to close your conversation with ${chat.name}?`,
            action: () => confirmCloseChat(chat.id, chat.isGroup),
        })
        setShowConfirmation(true)
    }

    const confirmCloseChat = (chatId, isGroup) => {
        // API call to close/leave chat
        router.post(
            route(isGroup ? "chat.leave" : "chat.close", chatId),
            {},
            {
                onSuccess: () => {
                    // Remove from local state
                    setChats(chats.filter((chat) => chat.id !== chatId))

                    // If this was the active chat, redirect to chat index
                    if (chatId === activeChatId) {
                        window.location.href = route("chat.index")
                    }
                },
            },
        )

        setShowConfirmation(false)
    }

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full hidden md:flex">
            {/* Search Bar and New Chat Button */}
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Find..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <p className="text-xs text-gray-500 mt-1">Search for chats with specific users</p>
                    </div>
                    <button
                        onClick={() => setShowCreateChatModal(true)}
                        className="ml-2 p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 flex-shrink-0"
                        title="New Chat"
                    >
                        <MessageSquare size={20} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Chat List - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {filteredChats.length > 0 ? (
                    filteredChats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group relative ${
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
                                        <div
                                            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer"
                                            onClick={(e) => handleProfileClick(e, chat)}
                                        >
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
                    <span className={`font-medium ${activeChatId === chat.id ? "text-blue-600" : ""}`}>
                      {chat.name}
                    </span>
                                        <span className="text-xs text-gray-500">12:30 PM</span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                                </div>
                            </div>

                            {/* Close button - visible on hover with tooltip */}
                            <div
                                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onMouseEnter={() => setHoveredChat(chat.id)}
                                onMouseLeave={() => setHoveredChat(null)}
                            >
                                <button
                                    onClick={(e) => handleCloseChat(e, chat)}
                                    className="p-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 relative"
                                >
                                    <X size={14} />
                                    {hoveredChat === chat.id && (
                                        <div className="absolute right-0 top-full mt-1 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                                            {chat.isGroup ? "Leave group" : "Close conversation"}
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-4 text-center text-gray-500">
                        {searchTerm ? "No chats match your search" : "No conversations yet"}
                        {!searchTerm && (
                            <button
                                onClick={() => setShowCreateChatModal(true)}
                                className="block mx-auto mt-2 text-blue-600 hover:text-blue-800"
                            >
                                Start a new conversation
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Navigation - Fixed Position */}
            <div className="p-3 border-t border-gray-200 flex justify-around bg-white flex-shrink-0">
                {/* Home Button - Stands out with blue background */}
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

                <Link
                    href={route("friends-list.index")}
                    className={`p-2 hover:bg-gray-100 rounded-full ${url.startsWith("/friends") ? "bg-gray-200" : ""}`}
                    title="Friends List"
                >
                    <Users size={20} className={url.startsWith("/friends") ? "text-blue-600" : ""} />
                </Link>

                <Link href={route("profile.edit")} className="p-2 hover:bg-gray-100 rounded-full" title="Profile">
                    <User size={20} />
                </Link>

                <Link method="post" href={route("logout")} className="p-2 hover:bg-gray-100 rounded-full" title="Logout">
                    <LogOut size={20} />
                </Link>
            </div>

            {/* User Profile Card */}
            {selectedUser && (
                <UserProfileCard
                    user={selectedUser}
                    isOpen={showProfileCard}
                    onClose={() => setShowProfileCard(false)}
                    isFriend={true}
                    isBlocked={false}
                    isRequestSent={false}
                    isRequestReceived={false}
                />
            )}

            {/* Create Chat Modal */}
            <CreateChatModal
                isOpen={showCreateChatModal}
                onClose={() => setShowCreateChatModal(false)}
            />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showConfirmation}
                onClose={() => setShowConfirmation(false)}
                onConfirm={confirmationData.action}
                title={confirmationData.title}
                message={confirmationData.message}
                confirmText="Confirm"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    )
}
