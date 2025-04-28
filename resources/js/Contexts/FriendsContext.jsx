"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { usePage, router } from "@inertiajs/react"

// Create context
const FriendsContext = createContext(null)

// Custom hook to use the friends context
export const useFriends = () => {
    const context = useContext(FriendsContext)
    if (!context) {
        throw new Error("useFriends must be used within a FriendsProvider")
    }
    return context
}

export const FriendsProvider = ({ children }) => {
    const { auth, route } = usePage().props
    const initialData = usePage().props

    // Initialize state with data from props
    const [friends, setFriends] = useState(initialData.friends || [])
    const [incomingRequests, setIncomingRequests] = useState(initialData.incomingFriendRequests || [])
    const [outgoingRequests, setOutgoingRequests] = useState(initialData.outgoingFriendRequests || [])
    const [blockedUsers, setBlockedUsers] = useState(initialData.blocked || [])
    const [selectedUser, setSelectedUser] = useState(null)
    const [showProfileCard, setShowProfileCard] = useState(false)
    const [notification, setNotification] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Sort friends: online first, then alphabetically
    const sortedFriends = [...friends].sort((a, b) => {
        // First sort by status (online first)
        if (a.status === "online" && b.status !== "online") return -1
        if (a.status !== "online" && b.status === "online") return 1

        // Then sort alphabetically by name
        return a.name.localeCompare(b.name)
    })

    // Listen for real-time updates
    useEffect(() => {
        if (!auth?.user?.id) return

        const currentUserId = auth.user.id

        // Set up Pusher channels
        const requestsChannel = window.Echo.private(`friend-requests.${currentUserId}`)
        const friendsChannel = window.Echo.private(`friends.${currentUserId}`)
        const statusChannel = window.Echo.private(`user-status.${currentUserId}`)

        // Listen for new friend requests
        requestsChannel.listen(".NewFriendRequest", (senderInfo) => {
            const { id, name, status, avatar, last_online, email } = senderInfo

            const newRequest = {
                id,
                name,
                status,
                avatar,
                last_online,
                email,
            }

            setIncomingRequests((prev) => [newRequest, ...prev])
            showNotification("success", `New friend request from ${name}`)
        })

        // Listen for friend request accepted events
        requestsChannel.listen(".AcceptedFriendRequest", (newFriendData) => {
            const { id, name, email, status, last_online } = newFriendData

            // Add to friends list
            const newFriend = {
                id,
                name,
                email,
                status,
                avatar: newFriendData.avatar ?? null,
                last_online,
            }

            setFriends((prev) => [newFriend, ...prev])

            // Remove from outgoing requests
            setOutgoingRequests((prev) => prev.filter((request) => request.id !== id))
            showNotification("success", `${name} accepted your friend request`)
        })

        // Listen for friend request rejected/canceled events
        requestsChannel.listen(".RemovedFriendRequest", (removalData) => {
            if (removalData.deletionType === "rejection") {
                // Remove from outgoing requests
                setOutgoingRequests((prev) => prev.filter((request) => request.id !== removalData.recipientId))
                showNotification("error", `${removalData.recipientName} declined your friend request`)
            }

            if (removalData.deletionType === "cancellation") {
                setIncomingRequests((prev) => prev.filter((request) => request.id !== removalData.senderId))
            }
        })

        // Listen for friend removal events
        friendsChannel.listen(".RemovedFriend", (removalData) => {
            setFriends((prev) => prev.filter((friend) => friend.id !== removalData.removerId))
            showNotification("info", `${removalData.removerName} removed you as a friend`)
        })

        // Listen for user status changes
        statusChannel.listen(".UserStatusChanged", (statusData) => {
            const { userId, status, lastOnline } = statusData

            setFriends((prev) =>
                prev.map((friend) => (friend.id === userId ? { ...friend, status, last_online: lastOnline } : friend)),
            )
        })

        // Cleanup function
        return () => {
            requestsChannel.stopListening(".NewFriendRequest")
            requestsChannel.stopListening(".AcceptedFriendRequest")
            requestsChannel.stopListening(".RemovedFriendRequest")
            friendsChannel.stopListening(".RemovedFriend")
            statusChannel.stopListening(".UserStatusChanged")
        }
    }, [auth?.user?.id])

    // Helper function to show notifications
    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    // Handle relationship changes (updated to use separate controllers)
    const handleRelationshipChange = async (userId, userName, currentRelationship) => {
        setIsProcessing(true)

        try {
            if (currentRelationship === "blocked") {
                // Use blocked-list.destroy for blocked users
                router.delete(route("blocked-list.destroy"), {
                    data: {
                        blockedId: userId,
                    },
                    onSuccess: (page) => {
                        const { notification } = page.props

                        showNotification(notification.type, notification.message)

                        if (notification.statusCode === 200) {
                            setBlockedUsers((prev) => prev.filter((user) => user.id !== userId))
                        }
                    },
                    onError: (errors) => {
                        showNotification("error", errors?.message || "Failed to unblock user.")
                    },
                    onFinish: () => {
                        setIsProcessing(false)
                    },
                })
            } else if (currentRelationship === "friends") {
                // Use friends-list.destroy for friends
                router.delete(route("friends-list.destroy"), {
                    data: {
                        friendId: userId,
                    },
                    onSuccess: (page) => {
                        const { notification } = page.props

                        showNotification(notification.type, notification.message)

                        if (notification.statusCode === 200) {
                            setFriends((prev) => prev.filter((friend) => friend.id !== userId))
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
        } catch (error) {
            showNotification("error", "Failed to process your request")
            setIsProcessing(false)
        }
    }

    // Open profile card
    const openProfileCard = (user) => {
        setSelectedUser(user)
        setShowProfileCard(true)
    }

    // Close profile card
    const closeProfileCard = () => {
        setShowProfileCard(false)
    }

    // Context value
    const value = {
        friends,
        setFriends,
        sortedFriends,
        incomingRequests,
        setIncomingRequests,
        outgoingRequests,
        setOutgoingRequests,
        blockedUsers,
        setBlockedUsers,
        selectedUser,
        setSelectedUser,
        showProfileCard,
        setShowProfileCard,
        notification,
        setNotification,
        handleRelationshipChange,
        openProfileCard,
        closeProfileCard,
        showNotification,
        isProcessing,
    }

    return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>
}
