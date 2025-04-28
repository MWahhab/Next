"use client"

import { useState, useEffect, useRef } from "react"
import { X, MessageSquare, UserMinus, UserPlus, Calendar, CheckCircle, Clock, Mail } from "lucide-react"
import { router, usePage } from "@inertiajs/react"
import { useFriends } from "@/Contexts/FriendsContext"

export default function UserProfileCard({
                                            user,
                                            isOpen,
                                            onClose,
                                            isFriend = false,
                                            isBlocked = false,
                                            isRequestSent = false,
                                            isRequestReceived = false,
                                        }) {
    const { setFriends, setBlockedUsers, setIncomingRequests, setOutgoingRequests, showNotification } = useFriends()

    const { props } = usePage()
    const { auth } = props

    const [isProcessing, setIsProcessing] = useState(false)
    const cardRef = useRef(null)
    const [userStats, setUserStats] = useState({
        tasksCreated: 0,
        tasksCompleted: 0,
        messagesExchanged: 0,
        plansCoordinated: 0,
    })

    // Close card when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cardRef.current && !cardRef.current.contains(event.target)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
            // Fetch user stats
            fetchUserStats()
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isOpen, onClose])

    // Fetch user stats (in a real app, this would be an API call)
    const fetchUserStats = () => {
        // Simulate API call with random data
        // In a real app, you would fetch this data from your backend
        setTimeout(() => {
            setUserStats({
                tasksCreated: Math.floor(Math.random() * 100) + 20,
                tasksCompleted: Math.floor(Math.random() * 80) + 10,
                messagesExchanged: Math.floor(Math.random() * 200) + 50,
                plansCoordinated: Math.floor(Math.random() * 30) + 5,
            })
        }, 500)
    }

    // Handle message user
    const handleMessageUser = () => {
        // Check if chat exists first
        router.get(route("chat.find-or-create", user.id), {
            onSuccess: (page) => {
                const { chat } = page.props
                if (chat) {
                    window.location.href = `/chat/${chat.id}`
                }
            },
            onError: () => {
                showNotification("error", "Failed to start chat")
            },
        })
        onClose()
    }

    // Handle remove friend
    const handleRemoveFriend = () => {
        setIsProcessing(true)

        router.delete(route("relationship.destroy", user.id), {
            data: {
                currentRelationship: "friends",
            },
            onSuccess: (page) => {
                const { notification } = page.props

                showNotification(notification.type, notification.message)

                if (notification.statusCode === 200) {
                    setFriends((prev) => prev.filter((friend) => friend.id !== user.id))
                }
            },
            onError: (errors) => {
                showNotification("error", errors?.message || "Failed to remove friend.")
            },
            onFinish: () => {
                setIsProcessing(false)
            },
        })
    }

    // Handle add friend
    const handleAddFriend = () => {
        setIsProcessing(true)

        router.post(
            route("friend-request.store"),
            {
                recipientEmail: user.email,
            },
            {
                onSuccess: (page) => {
                    const { notification, friendRequest } = page.props

                    showNotification(notification.type, notification.message)

                    if (notification.statusCode === 201 && friendRequest) {
                        const { id, name, status, avatar, last_online, email } = friendRequest

                        const newOutgoingRequest = {
                            id,
                            name,
                            email,
                            status,
                            avatar,
                            last_online,
                        }

                        setOutgoingRequests((prev) => [newOutgoingRequest, ...prev])
                    }
                },
                onError: (errors) => {
                    showNotification("error", errors?.recipientEmail || `Failed to send friend request.`)
                },
                onFinish: () => {
                    setIsProcessing(false)
                },
            },
        )
    }

    // Handle accept friend request
    const handleAcceptRequest = () => {
        setIsProcessing(true)

        router.post(
            route("relationship.store", user.id),
            {
                relationshipType: "friends",
            },
            {
                onSuccess: (page) => {
                    const { notification, friend } = page.props

                    showNotification(notification.type, notification.message)

                    if (notification.statusCode === 201 && friend) {
                        // Add to friends list
                        setFriends((prev) => [friend, ...prev])
                        // Remove from requests
                        setIncomingRequests((prev) => prev.filter((req) => req.id !== user.id))
                    }
                },
                onError: (errors) => {
                    showNotification("error", errors?.message || "Failed to accept friend request.")
                },
                onFinish: () => {
                    setIsProcessing(false)
                },
            },
        )
    }

    // Handle cancel friend request
    const handleCancelRequest = () => {
        setIsProcessing(true)

        router.delete(route("friend-request.destroy", [auth.user.id, user.id]), {
            data: {
                deletionType: "cancellation",
            },
            onSuccess: (page) => {
                const { notification } = page.props

                showNotification(notification.type, notification.message)

                if (notification.statusCode === 200) {
                    setOutgoingRequests((prev) => prev.filter((request) => request.id !== user.id))
                }
            },
            onError: (errors) => {
                showNotification("error", errors?.message || "Failed to cancel friend request.")
            },
            onFinish: () => {
                setIsProcessing(false)
            },
        })
    }

    // Handle block user
    const handleBlockUser = () => {
        setIsProcessing(true)

        router.post(
            route("relationship.store", user.id),
            {
                relationshipType: "blocked",
            },
            {
                onSuccess: (page) => {
                    const { notification, blockedUser } = page.props

                    showNotification(notification.type, notification.message)

                    if (notification.statusCode === 201 && blockedUser) {
                        // Add to blocked list
                        setBlockedUsers((prev) => [blockedUser, ...prev])

                        // Remove from friends if they were a friend
                        if (isFriend) {
                            setFriends((prev) => prev.filter((friend) => friend.id !== user.id))
                        }

                        // Remove from requests if there was a pending request
                        if (isRequestReceived) {
                            setIncomingRequests((prev) => prev.filter((req) => req.id !== user.id))
                        }

                        if (isRequestSent) {
                            setOutgoingRequests((prev) => prev.filter((req) => req.id !== user.id))
                        }
                    }
                },
                onError: (errors) => {
                    showNotification("error", errors?.message || "Failed to block user.")
                },
                onFinish: () => {
                    setIsProcessing(false)
                },
            },
        )
    }

    // Handle unblock user
    const handleUnblockUser = () => {
        setIsProcessing(true)

        router.delete(route("relationship.destroy", user.id), {
            data: {
                currentRelationship: "blocked",
            },
            onSuccess: (page) => {
                const { notification } = page.props

                showNotification(notification.type, notification.message)

                if (notification.statusCode === 200) {
                    setBlockedUsers((prev) => prev.filter((blockedUser) => blockedUser.id !== user.id))
                }
            },
            onError: (errors) => {
                showNotification("error", errors?.message || "Failed to unblock user.")
            },
            onFinish: () => {
                setIsProcessing(false)
            },
        })
    }

    if (!isOpen) return null

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "online":
                return "bg-green-500"
            case "away":
                return "bg-yellow-500"
            case "offline":
                return "bg-gray-400"
            default:
                return "bg-gray-400"
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={cardRef} className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="relative bg-gray-50 p-6 border-b border-gray-200">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center">
                        <div className="relative">
                            {user.avatar ? (
                                <img
                                    src={user.avatar || "/placeholder.svg"}
                                    alt={user.name}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                    <span className="text-2xl font-semibold text-gray-600">{user.name.charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                            <div
                                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(
                                    user.status,
                                )}`}
                            ></div>
                        </div>

                        <div className="ml-4">
                            <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
                            <div className="flex items-center text-sm text-gray-500">
                <span className="flex items-center">
                  {user.status === "online" ? (
                      "Online"
                  ) : (
                      <>
                          <Clock size={14} className="mr-1" />
                          {user.last_online}
                      </>
                  )}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notification message */}
                    {/* {notification && (
            <div
              className={`mt-4 p-2 rounded-lg flex items-center text-sm ${
                notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              <span>{notification.message}</span>
              <button onClick={() => setNotification(null)} className="ml-auto text-gray-500 hover:text-gray-700">
                <X size={14} />
              </button>
            </div>
          )} */}
                </div>

                {/* User Info */}
                <div className="p-6">
                    {/* Contact Info */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Info</h3>
                        <div className="flex items-center text-gray-700">
                            <Mail size={16} className="mr-2 text-gray-400" />
                            <span>{user.email}</span>
                        </div>
                    </div>

                    {/* User Stats */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Activity</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                    <Calendar size={14} className="mr-2 text-gray-400" />
                                    Tasks Created
                                </div>
                                <span className="font-medium text-lg">{userStats.tasksCreated}</span>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                    <CheckCircle size={14} className="mr-2 text-gray-400" />
                                    Tasks Completed
                                </div>
                                <span className="font-medium text-lg">{userStats.tasksCompleted}</span>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 col-span-2">
                                <div className="flex items-center text-sm text-gray-600 mb-1">
                                    <MessageSquare size={14} className="mr-2 text-gray-400" />
                                    Messages Exchanged
                                </div>
                                <span className="font-medium text-lg">{userStats.messagesExchanged}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3">
                        {/* Message Button - Always visible */}
                        <button
                            onClick={handleMessageUser}
                            disabled={isProcessing || isBlocked}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <MessageSquare size={18} className="mr-2" />
                            Message
                        </button>

                        {/* Friend Status Buttons - Conditionally rendered */}
                        {isFriend && (
                            <button
                                onClick={handleRemoveFriend}
                                disabled={isProcessing}
                                className="w-full py-2 px-4 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <UserMinus size={18} className="mr-2" />
                                Remove Friend
                            </button>
                        )}

                        {!isFriend && !isRequestSent && !isRequestReceived && !isBlocked && (
                            <button
                                onClick={handleAddFriend}
                                disabled={isProcessing}
                                className="w-full py-2 px-4 bg-green-50 text-green-600 border border-green-200 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <UserPlus size={18} className="mr-2" />
                                Add Friend
                            </button>
                        )}

                        {isRequestSent && (
                            <button
                                onClick={handleCancelRequest}
                                disabled={isProcessing}
                                className="w-full py-2 px-4 bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-md hover:bg-yellow-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <X size={18} className="mr-2" />
                                Cancel Friend Request
                            </button>
                        )}

                        {isRequestReceived && (
                            <button
                                onClick={handleAcceptRequest}
                                disabled={isProcessing}
                                className="w-full py-2 px-4 bg-green-50 text-green-600 border border-green-200 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                <CheckCircle size={18} className="mr-2" />
                                Accept Friend Request
                            </button>
                        )}

                        {/* Block/Unblock Button - Always visible */}
                        {isBlocked ? (
                            <button
                                onClick={handleUnblockUser}
                                disabled={isProcessing}
                                className="w-full py-2 px-4 bg-gray-50 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Unblock User
                            </button>
                        ) : (
                            <button
                                onClick={handleBlockUser}
                                disabled={isProcessing}
                                className="w-full py-2 px-4 bg-gray-50 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Block User
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
