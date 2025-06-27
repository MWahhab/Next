"use client"

import { useState, useEffect } from "react"
import { X, Search, User, Check } from "lucide-react"
import { router, usePage } from "@inertiajs/react"
import { useFriends } from "@/Contexts/FriendsContext"

export default function CreateChatModal({ isOpen, onClose }) {
    const [selectedFriends, setSelectedFriends] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [chatTitle, setChatTitle] = useState("")
    const [chatDescription, setChatDescription] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({})

    const { route } = usePage().props
    const { sortedFriends } = useFriends() // Get friends from context

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedFriends([])
            setSearchTerm("")
            setChatTitle("")
            setChatDescription("")
            setIsSubmitting(false)
            setErrors({})
        }
    }, [isOpen])

    if (!isOpen) return null

    const filteredFriends = sortedFriends.filter(
        (friend) =>
            friend.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedFriends.some((f) => f.id === friend.id),
    )

    const handleSelectFriend = (friend) => {
        if (selectedFriends.some((f) => f.id === friend.id)) {
            setSelectedFriends(selectedFriends.filter((f) => f.id !== friend.id))
        } else {
            setSelectedFriends([...selectedFriends, friend])
        }
    }

    const handleCreateChat = () => {
        if (selectedFriends.length === 0) {
            setErrors({ general: "Please select at least one friend" })
            return
        }

        const isGroupChat = selectedFriends.length > 1

        // For group chats, title is required
        if (isGroupChat && !chatTitle.trim()) {
            setErrors({ title: "Title is required for group chats" })
            return
        }

        setIsSubmitting(true)

        const friendIds = selectedFriends.map((friend) => friend.id)

        router.post(
            route("chat.create"),
            {
                participants: friendIds,
                title: isGroupChat ? chatTitle : null,
                description: isGroupChat ? chatDescription : null,
                isGroup: isGroupChat,
            },
            {
                onSuccess: (page) => {
                    const { chat } = page.props
                    if (chat) {
                        window.location.href = route("chat.show", chat.id)
                    }
                    onClose()
                },
                onError: (errors) => {
                    setErrors(errors)
                    setIsSubmitting(false)
                },
            },
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">New Conversation</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    {errors.general && (
                        <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-sm">{errors.general}</div>
                    )}

                    {/* Friend Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Friends</label>
                        <div className="relative mb-2">
                            <input
                                type="text"
                                placeholder="Search friends..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>

                        {/* Selected Friends */}
                        {selectedFriends.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {selectedFriends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                                    >
                                        <span>{friend.name}</span>
                                        <button
                                            onClick={() => handleSelectFriend(friend)}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Friend List */}
                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                            {filteredFriends.length > 0 ? (
                                filteredFriends.map((friend) => (
                                    <div
                                        key={friend.id}
                                        className={`flex items-center p-2 hover:bg-gray-50 cursor-pointer ${
                                            selectedFriends.some((f) => f.id === friend.id) ? "bg-blue-50" : ""
                                        }`}
                                        onClick={() => handleSelectFriend(friend)}
                                    >
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                                            <User size={16} className="text-gray-600" />
                                        </div>
                                        <span className="flex-grow">{friend.name}</span>
                                        {selectedFriends.some((f) => f.id === friend.id) && <Check size={16} className="text-blue-600" />}
                                    </div>
                                ))
                            ) : (
                                <div className="p-3 text-center text-gray-500">
                                    {searchTerm ? "No friends match your search" : "No friends available"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Group Chat Details - Only show if multiple friends selected */}
                    {selectedFriends.length > 1 && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Group Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter group name"
                                    className={`w-full px-3 py-2 border ${errors.title ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    value={chatTitle}
                                    onChange={(e) => setChatTitle(e.target.value)}
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-gray-400">(optional)</span>
                                </label>
                                <textarea
                                    placeholder="Enter group description"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={chatDescription}
                                    onChange={(e) => setChatDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="p-4 border-t flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mr-2">
                        Cancel
                    </button>
                    <button
                        onClick={handleCreateChat}
                        disabled={selectedFriends.length === 0 || (selectedFriends.length > 1 && !chatTitle.trim()) || isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Creating..." : "Create Chat"}
                    </button>
                </div>
            </div>
        </div>
    )
}
