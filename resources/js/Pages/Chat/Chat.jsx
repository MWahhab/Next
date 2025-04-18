"use client"

import { useState, useRef, useEffect } from "react"
import { Head } from "@inertiajs/react"
import { usePage } from "@inertiajs/react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Send, Paperclip, ImageIcon, Smile, User, Users, MessageSquare } from "lucide-react"

export default function Chat({ auth }) {
    const { params } = usePage().props
    const chatId = params?.id ? Number.parseInt(params.id) : null

    const [message, setMessage] = useState("")
    const [activeChat, setActiveChat] = useState(null)
    const messagesEndRef = useRef(null)

    // Dummy data for chats
    const [chats, setChats] = useState([
        {
            id: 1,
            name: "John Doe",
            isGroup: false,
            messages: [
                { id: 1, sender: "John Doe", text: "Hey, how are you?", time: "10:30 AM", isMe: false },
                { id: 2, sender: "Me", text: "I'm good, thanks! How about you?", time: "10:32 AM", isMe: true },
                { id: 3, sender: "John Doe", text: "Doing well. Did you finish that task?", time: "10:33 AM", isMe: false },
                {
                    id: 4,
                    sender: "Me",
                    text: "Yes, I just completed it. I'll send you the details soon.",
                    time: "10:35 AM",
                    isMe: true,
                },
            ],
        },
        {
            id: 2,
            name: "Team Alpha",
            isGroup: true,
            messages: [
                { id: 1, sender: "Sarah Wilson", text: "Meeting at 3pm today", time: "09:15 AM", isMe: false },
                { id: 2, sender: "Mike Johnson", text: "I'll be there", time: "09:20 AM", isMe: false },
                { id: 3, sender: "Me", text: "Should I prepare the presentation?", time: "09:25 AM", isMe: true },
                { id: 4, sender: "Sarah Wilson", text: "Yes, please. Focus on the Q2 results.", time: "09:30 AM", isMe: false },
            ],
        },
        {
            id: 3,
            name: "Sarah Wilson",
            isGroup: false,
            messages: [
                { id: 1, sender: "Sarah Wilson", text: "Hi there!", time: "11:00 AM", isMe: false },
                { id: 2, sender: "Me", text: "Hello Sarah, how can I help you?", time: "11:05 AM", isMe: true },
                {
                    id: 3,
                    sender: "Sarah Wilson",
                    text: "I wanted to discuss the project timeline",
                    time: "11:10 AM",
                    isMe: false,
                },
                { id: 4, sender: "Me", text: "Sure, I'm available now if you want to talk", time: "11:15 AM", isMe: true },
            ],
        },
    ])

    useEffect(() => {
        // Set the active chat based on the URL parameter
        if (chatId) {
            const chat = chats.find((c) => c.id === chatId)
            if (chat) {
                setActiveChat(chat)
            }
        } else if (chats.length > 0 && !activeChat) {
            // Default to first chat if no ID is provided
            setActiveChat(chats[0])
        }

        // Scroll to bottom of messages
        scrollToBottom()
    }, [activeChat, chats, chatId])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleSendMessage = (e) => {
        e.preventDefault()

        if (message.trim() && activeChat) {
            const newMessage = {
                id: activeChat.messages.length + 1,
                sender: "Me",
                text: message,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                isMe: true,
            }

            const updatedChats = chats.map((chat) => {
                if (chat.id === activeChat.id) {
                    return {
                        ...chat,
                        messages: [...chat.messages, newMessage],
                    }
                }
                return chat
            })

            setChats(updatedChats)
            setActiveChat(updatedChats.find((chat) => chat.id === activeChat.id))
            setMessage("")
        }
    }

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title={activeChat ? `Chat - ${activeChat.name}` : "Chat"} />

            <div className="flex h-full">
                {/* Chat List (Mobile) */}
                <div className="md:hidden w-full">
                    {!activeChat ? (
                        <div className="h-full">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="font-semibold text-lg">Chats</h2>
                            </div>

                            <div className="overflow-y-auto">
                                {chats.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                        onClick={() => setActiveChat(chat)}
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
                                            </div>
                                            <div className="ml-3 flex-1">
                                                <div className="flex justify-between">
                                                    <span className="font-medium">{chat.name}</span>
                                                    <span className="text-xs text-gray-500">
                            {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].time : ""}
                          </span>
                                                </div>
                                                <p className="text-sm text-gray-600 truncate">
                                                    {chat.messages.length > 0
                                                        ? `${chat.messages[chat.messages.length - 1].sender === "Me" ? "You: " : ""}${chat.messages[chat.messages.length - 1].text}`
                                                        : "No messages yet"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            <div className="p-3 border-b border-gray-200 flex items-center">
                                <button className="mr-2 p-1 rounded-full hover:bg-gray-100" onClick={() => setActiveChat(null)}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div className="flex items-center">
                                    {activeChat.isGroup ? (
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Users size={16} className="text-blue-600" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User size={16} className="text-gray-600" />
                                        </div>
                                    )}
                                    <span className="ml-2 font-medium">{activeChat.name}</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {activeChat.messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                                                msg.isMe ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {!msg.isMe && activeChat.isGroup && <div className="font-medium text-xs mb-1">{msg.sender}</div>}
                                            <p>{msg.text}</p>
                                            <div className={`text-xs mt-1 text-right ${msg.isMe ? "text-blue-200" : "text-gray-500"}`}>
                                                {msg.time}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200">
                                <div className="flex items-center">
                                    <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
                                        <Paperclip size={20} />
                                    </button>
                                    <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
                                        <ImageIcon size={20} />
                                    </button>
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 mx-2 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
                                        <Smile size={20} />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!message.trim()}
                                        className="p-2 bg-blue-600 text-white rounded-full disabled:bg-blue-300"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:flex w-full h-full">
                    {/* Chat Area */}
                    <div className="w-full flex flex-col">
                        {activeChat ? (
                            <>
                                <div className="p-3 border-b border-gray-200 flex items-center bg-white">
                                    {activeChat.isGroup ? (
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Users size={16} className="text-blue-600" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User size={16} className="text-gray-600" />
                                        </div>
                                    )}
                                    <span className="ml-2 font-medium">{activeChat.name}</span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                    {activeChat.messages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                                                    msg.isMe ? "bg-blue-600 text-white" : "bg-white text-gray-800 border border-gray-200"
                                                }`}
                                            >
                                                {!msg.isMe && activeChat.isGroup && (
                                                    <div className="font-medium text-xs mb-1">{msg.sender}</div>
                                                )}
                                                <p>{msg.text}</p>
                                                <div className={`text-xs mt-1 text-right ${msg.isMe ? "text-blue-200" : "text-gray-500"}`}>
                                                    {msg.time}
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
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 mx-2 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button type="button" className="p-2 text-gray-500 hover:text-gray-700 rounded-full">
                                            <Smile size={20} />
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!message.trim()}
                                            className="p-2 bg-blue-600 text-white rounded-full disabled:bg-blue-300"
                                        >
                                            <Send size={20} />
                                        </button>
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
            </div>
        </AuthenticatedLayout>
    )
}
