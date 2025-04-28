"use client"

import { useState, useRef, useEffect } from "react"
import { Head } from "@inertiajs/react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import {
    Send,
    Paperclip,
    ImageIcon,
    Smile,
    User,
    Users,
    MessageSquare,
    MoreVertical,
    Check,
    CheckCheck,
    Clock,
    Trash2,
    Edit,
    Eye,
    EyeOff,
    X,
} from "lucide-react"
import UserProfileCard from "@/Components/UserProfileCard"
import { useFriends } from "@/Contexts/FriendsContext"
import { router, useRoute } from "@inertiajs/react"

export default function Chat({ auth, chat, messages: initialMessages, participants }) {
    const { friends, openProfileCard } = useFriends()
    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState(initialMessages || [])
    const [activeChat, setActiveChat] = useState(chat || null)
    const [showProfileCard, setShowProfileCard] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [editingMessage, setEditingMessage] = useState(null)
    const [editText, setEditText] = useState("")
    const [showMessageOptions, setShowMessageOptions] = useState(null)
    const [showSeenBy, setShowSeenBy] = useState(null)
    const messagesEndRef = useRef(null)
    const messageInputRef = useRef(null)

    // Determine if this is a group chat
    const isGroupChat = participants && participants.length > 2

    // For one-on-one chats, find the other participant
    const otherParticipant = !isGroupChat && participants ? participants.find((p) => p.id !== auth.user.id) : null

    // Find the corresponding friend object for the other participant
    const chatFriend = otherParticipant ? friends.find((f) => f.id === otherParticipant.id) : null

    const route = useRoute()

    useEffect(() => {
        // Set the active chat based on the props
        if (chat) {
            setActiveChat(chat)
        }

        // Scroll to bottom of messages
        scrollToBottom()

        // Mark messages as seen when opening the chat
        if (chat?.id) {
            markMessagesAsSeen(chat.id)
        }

        // Set up Pusher channel for real-time messages
        if (chat?.id) {
            const channel = window.Echo.private(`chat.${chat.id}`)

            channel.listen(".MessageSent", (data) => {
                const { message } = data
                setMessages((prev) => [...prev, message])

                // Mark as seen if the chat is currently open
                markMessagesAsSeen(chat.id)
            })

            channel.listen(".MessageUpdated", (data) => {
                const { message } = data
                setMessages((prev) => prev.map((m) => (m.id === message.id ? message : m)))
            })

            channel.listen(".MessageDeleted", (data) => {
                const { messageId } = data
                setMessages((prev) => prev.filter((m) => m.id !== messageId))
            })

            channel.listen(".MessageSeen", (data) => {
                const { messageId, userId, userName } = data
                // Update the seen_by field for this message
                setMessages((prev) =>
                    prev.map((m) => {
                        if (m.id === messageId) {
                            const seenBy = m.seen_by || []
                            if (!seenBy.some((user) => user.id === userId)) {
                                return {
                                    ...m,
                                    seen_by: [...seenBy, { id: userId, name: userName }],
                                }
                            }
                        }
                        return m
                    }),
                )
            })

            return () => {
                channel.stopListening(".MessageSent")
                channel.stopListening(".MessageUpdated")
                channel.stopListening(".MessageDeleted")
                channel.stopListening(".MessageSeen")
            }
        }
    }, [chat])

    // Scroll to bottom whenever messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const markMessagesAsSeen = (chatId) => {
        router.post(route("chat.mark-seen", chatId))
    }

    const handleSendMessage = (e) => {
        e.preventDefault()

        if (message.trim() && activeChat) {
            router.post(
                route("chat.send-message", activeChat.id),
                {
                    message: message.trim(),
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setMessage("")
                        messageInputRef.current?.focus()
                    },
                },
            )
        }
    }

    const handleEditMessage = (messageId) => {
        const msg = messages.find((m) => m.id === messageId)
        if (msg) {
            setEditingMessage(messageId)
            setEditText(msg.message)
            setShowMessageOptions(null)
            setTimeout(() => {
                messageInputRef.current?.focus()
            }, 100)
        }
    }

    const handleSaveEdit = () => {
        if (editText.trim() && editingMessage) {
            router.put(
                route("chat.update-message", editingMessage),
                {
                    message: editText.trim(),
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setEditingMessage(null)
                        setEditText("")
                    },
                },
            )
        }
    }

    const handleCancelEdit = () => {
        setEditingMessage(null)
        setEditText("")
    }

    const handleDeleteMessage = (messageId) => {
        router.delete(route("chat.delete-message", messageId), {
            preserveScroll: true,
            onSuccess: () => {
                setShowMessageOptions(null)
            },
        })
    }

    const handleHideChat = () => {
        router.put(route("chat.hide", activeChat.id), {
            preserveScroll: true,
            onSuccess: (page) => {
                const { notification } = page.props
                if (notification.statusCode === 200) {
                    window.location.href = route("chat.index")
                }
            },
        })
    }

    const handleProfileClick = () => {
        if (isGroupChat) return

        if (chatFriend) {
            setSelectedUser(chatFriend)
            setShowProfileCard(true)
        }
    }

    const getMessageStatusIcon = (message) => {
        if (!message.seen_by) return <Clock size={14} className="text-gray-400" />

        const seenByOthers = message.seen_by.some((user) => user.id !== auth.user.id)

        if (seenByOthers) {
            return <CheckCheck size={14} className="text-blue-500" />
        } else {
            return <Check size={14} className="text-gray-400" />
        }
    }

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title={activeChat ? `Chat - ${activeChat.name}` : "Chat"} />

            <div className="flex h-full">
                {/* Chat Area */}
                <div className="w-full flex flex-col">
                    {activeChat ? (
                        <>
                            <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-white">
                                <div className="flex items-center cursor-pointer" onClick={handleProfileClick}>
                                    {isGroupChat ? (
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Users size={16} className="text-blue-600" />
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                <User size={16} className="text-gray-600" />
                                            </div>
                                            {chatFriend && (
                                                <div
                                                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white ${
                                                        chatFriend.status === "online"
                                                            ? "bg-green-500"
                                                            : chatFriend.status === "away"
                                                                ? "bg-yellow-500"
                                                                : "bg-gray-400"
                                                    }`}
                                                ></div>
                                            )}
                                        </div>
                                    )}
                                    <span className="ml-2 font-medium">{activeChat.name}</span>
                                </div>

                                <div className="flex items-center">
                                    <button
                                        onClick={handleHideChat}
                                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                                        title="Hide Chat"
                                    >
                                        <EyeOff size={18} />
                                    </button>
                                    <div className="relative group">
                                        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                                            <MoreVertical size={18} />
                                        </button>
                                        <div className="absolute right-0 mt-1 w-48 bg-white shadow-lg rounded-md overflow-hidden z-10 hidden group-hover:block">
                                            {!isGroupChat && (
                                                <button
                                                    onClick={handleProfileClick}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                                >
                                                    View Profile
                                                </button>
                                            )}
                                            <button onClick={handleHideChat} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                                                Hide Chat
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.user_id === auth.user.id ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-xs md:max-w-md rounded-lg p-3 relative ${
                                                msg.user_id === auth.user.id
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white text-gray-800 border border-gray-200"
                                            }`}
                                        >
                                            {isGroupChat && msg.user_id !== auth.user.id && (
                                                <div className="font-medium text-xs mb-1">{msg.user?.name || "Unknown User"}</div>
                                            )}

                                            {editingMessage === msg.id ? (
                                                <div className="flex flex-col">
                                                    <input
                                                        type="text"
                                                        value={editText}
                                                        onChange={(e) => setEditText(e.target.value)}
                                                        className="p-1 border border-gray-300 rounded text-gray-800 mb-1"
                                                        ref={messageInputRef}
                                                    />
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleSaveEdit}
                                                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p>{msg.message}</p>
                                            )}

                                            <div
                                                className={`text-xs mt-1 text-right flex items-center justify-end ${
                                                    msg.user_id === auth.user.id ? "text-blue-200" : "text-gray-500"
                                                }`}
                                            >
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>

                                                {msg.user_id === auth.user.id && (
                                                    <div className="ml-1 relative">
                                                        <button
                                                            onClick={() => {
                                                                setShowMessageOptions(showMessageOptions === msg.id ? null : msg.id)
                                                                setShowSeenBy(null)
                                                            }}
                                                            className="p-0.5 hover:bg-blue-700 rounded"
                                                        >
                                                            <MoreVertical size={12} />
                                                        </button>

                                                        {showMessageOptions === msg.id && (
                                                            <div className="absolute right-0 bottom-full mb-1 w-32 bg-white shadow-lg rounded-md overflow-hidden z-10 text-left">
                                                                <button
                                                                    onClick={() => handleEditMessage(msg.id)}
                                                                    className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                                                >
                                                                    <Edit size={12} className="mr-1.5" /> Edit
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                                    className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-gray-100 flex items-center"
                                                                >
                                                                    <Trash2 size={12} className="mr-1.5" /> Delete
                                                                </button>
                                                                {isGroupChat && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setShowSeenBy(showSeenBy === msg.id ? null : msg.id)
                                                                            setShowMessageOptions(null)
                                                                        }}
                                                                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                                                    >
                                                                        <Eye size={12} className="mr-1.5" /> Seen by
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {showSeenBy === msg.id && (
                                                            <div className="absolute right-0 bottom-full mb-1 w-40 bg-white shadow-lg rounded-md overflow-hidden z-10">
                                                                <div className="p-2 text-xs text-gray-700">
                                                                    <div className="font-medium mb-1">Seen by:</div>
                                                                    {msg.seen_by && msg.seen_by.length > 0 ? (
                                                                        <ul className="space-y-1">
                                                                            {msg.seen_by.map((user) => (
                                                                                <li key={user.id} className="flex items-center">
                                                                                    <CheckCheck size={12} className="text-blue-500 mr-1" />
                                                                                    {user.name}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    ) : (
                                                                        <p className="text-gray-500">Not seen yet</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {msg.user_id === auth.user.id && !isGroupChat && (
                                                    <div className="ml-1">{getMessageStatusIcon(msg)}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-white">
                                <div className="flex items-center">
                                    <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
                                        <Paperclip size={20} />
                                    </button>
                                    <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
                                        <ImageIcon size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        value={editingMessage ? editText : message}
                                        onChange={(e) => (editingMessage ? setEditText(e.target.value) : setMessage(e.target.value))}
                                        placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
                                        className="flex-1 mx-2 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        ref={messageInputRef}
                                    />
                                    <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
                                        <Smile size={20} />
                                    </button>
                                    {editingMessage ? (
                                        <div className="flex">
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="p-2 bg-gray-200 text-gray-700 rounded-full mr-1"
                                            >
                                                <X size={20} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSaveEdit}
                                                disabled={!editText.trim()}
                                                className="p-2 bg-blue-600 text-white rounded-full disabled:bg-blue-300"
                                            >
                                                <Check size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={!message.trim()}
                                            className="p-2 bg-blue-600 text-white rounded-full disabled:bg-blue-300"
                                        >
                                            <Send size={20} />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-700">Select a chat</h3>
                                <p className="text-gray-500 mt-1">Choose a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
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
        </AuthenticatedLayout>
    )
}
