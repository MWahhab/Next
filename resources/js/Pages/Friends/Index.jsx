"use client"

import { useEffect, useState } from "react"
import { Head, router, usePage } from "@inertiajs/react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import {
    User,
    Users,
    ArrowLeft,
    MessageSquare,
    UserMinus,
    Check,
    X,
    Search,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    AlertCircle,
    Clock,
} from "lucide-react"
import { Link } from "@inertiajs/react"
import ConfirmationModal from "@/Components/ConfirmationModal"

export default function Friends({
                                    auth,
                                    friends: initialFriends,
                                    incomingFriendRequests: initialIncomingRequests,
                                    outgoingFriendRequests: initialOutgoingRequests,
                                    blocked: initialBlockedUsers,
                                }) {

    const [activeTab, setActiveTab] = useState("friends")
    const [requestsSubTab, setRequestsSubTab] = useState("incoming")
    const [currentPage, setCurrentPage] = useState({ friends: 1, incoming: 1, outgoing: 1, blocked: 1 })
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [confirmationData, setConfirmationData] = useState({
        title: "",
        message: "",
        action: null,
    })
    const [isProcessing, setIsProcessing] = useState(false)
    const [hoveredUser, setHoveredUser] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [showAddFriendInput, setShowAddFriendInput] = useState(false)
    const [friendEmail, setFriendEmail] = useState("")
    const [notification, setNotification] = useState(null)

    // Use the data from props with useState for local updates
    const [friends, setFriends] = useState(initialFriends || [])
    const [incomingRequests, setIncomingRequests] = useState(initialIncomingRequests || [])
    const [outgoingRequests, setOutgoingRequests] = useState(initialOutgoingRequests || [])
    const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers || [])

    // Listen for real-time friend request updates using Pusher
    useEffect(() => {
        const currentUserId = auth.user.id

        // Set up Pusher channel for friend requests
        const channel = window.Echo.private(`friend-requests.${currentUserId}`)

        // Listen for new friend requests
        channel.listen(".NewFriendRequest", (senderInfo) => {
            const { senderId, name, status, avatar, lastOnline, email } = senderInfo

            const newRequest = {
                id: senderId,
                name,
                status,
                avatar,
                last_online: lastOnline,
                email,
            }

            setIncomingRequests((prev) => [newRequest, ...prev])

            // Show notification
            setNotification({
                type: "success",
                message: `New friend request from ${name}`,
            })

            setTimeout(() => setNotification(null), 5000)
        })

        // Listen for friend request accepted events
        channel.listen(".AcceptedFriendRequest", (newFriendData) => {

            console.log("made it?")
            console.log("acepted friend data: ", newFriendData)
            const {id, name, email, status, last_online} = newFriendData;

            // Add to friends list
            const newFriend = {
                id,
                name,
                email,
                status,
                avatar: newFriendData.avatar ?? null,
                last_online,
            }

            console.log("newly added friend: ", newFriend)

            setFriends((prev) => [newFriend, ...prev])

            // Remove from outgoing requests
            setOutgoingRequests((prev) => prev.filter((request) => request.id !== id))

            // Show notification
            setNotification({
                type: "success",
                message: `${name} accepted your friend request`,
            })

            setTimeout(() => setNotification(null), 5000)
        })

        //Listen for friend request rejected/canceled events
        channel.listen(".RemovedFriendRequest", (removalData) => {
            if (removalData.deletionType === "rejection") {
                // Remove from outgoing requests
                setOutgoingRequests((prev) => prev.filter((request) => request.id !== removalData.recipientId))

                setNotification({
                    type: "error",
                    message: `${removalData.recipientName} declined your friend request`,
                })
            }

            if (removalData.deletionType === "cancellation") {
                setIncomingRequests((prev) => prev.filter((request) => request.id !== removalData.senderId))
            }

            setTimeout(() => setNotification(null), 5000)
        })

        // Cleanup function
        return () => {
            channel.stopListening(".NewFriendRequest")
            channel.stopListening(".FriendRequestAccepted")
            channel.stopListening(".RemovedFriendRequest")
        }
    }, [auth.user.id])

    // Items per page
    const itemsPerPage = 8

    // Filter friends and requests based on search term
    const filteredFriends = friends.filter((friend) => friend.name.toLowerCase().includes(searchTerm.toLowerCase()))

    const filteredIncomingRequests = incomingRequests.filter((request) =>
        request.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const filteredOutgoingRequests = outgoingRequests.filter((request) =>
        request.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const filteredBlockedUsers = blockedUsers.filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()))

    // Calculate total pages
    const totalPages = {
        friends: Math.ceil(filteredFriends.length / itemsPerPage),
        incoming: Math.ceil(filteredIncomingRequests.length / itemsPerPage),
        outgoing: Math.ceil(filteredOutgoingRequests.length / itemsPerPage),
        blocked: Math.ceil(filteredBlockedUsers.length / itemsPerPage),
    }

    // Get current items
    const getCurrentItems = (items, page) => {
        const startIndex = (page - 1) * itemsPerPage
        return items.slice(startIndex, startIndex + itemsPerPage)
    }

    const currentFriends = getCurrentItems(filteredFriends, currentPage.friends)
    const currentIncomingRequests = getCurrentItems(filteredIncomingRequests, currentPage.incoming)
    const currentOutgoingRequests = getCurrentItems(filteredOutgoingRequests, currentPage.outgoing)
    const currentBlockedUsers = getCurrentItems(filteredBlockedUsers, currentPage.blocked)

    // Handle page change
    const handlePageChange = (tab, newPage) => {
        setCurrentPage((prev) => ({
            ...prev,
            [tab]: newPage,
        }))
    }

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab)
        // Reset to first page when changing tabs
        setCurrentPage((prev) => ({
            ...prev,
            [tab]: 1,
        }))
    }

    // Handle requests sub-tab change
    const handleRequestsSubTabChange = (subTab) => {
        setRequestsSubTab(subTab)
    }

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

    // Get search placeholder based on active tab
    const getSearchPlaceholder = () => {
        if (activeTab === "friends") {
            return "Search friends..."
        } else if (activeTab === "requests") {
            return requestsSubTab === "incoming" ? "Search incoming requests..." : "Search outgoing requests..."
        } else if (activeTab === "blocked") {
            return "Search blocked users..."
        }
        return "Search..."
    }

    // Handle message user
    const handleMessageUser = (userId) => {
        window.location.href = `/chat/${userId}`
    }

    // Handle remove friend
    const handleRemoveFriend = (userId, userName) => {
        setConfirmationData({
            title: "Remove Friend",
            message: `Are you sure you want to remove ${userName} from your friends list?`,
            action: () => confirmRemoveFriend(userId),
        })
        setShowConfirmation(true)
    }

    // Confirm remove friend
    const confirmRemoveFriend = (userId) => {
        setIsProcessing(true)
        // Implement API call to remove friend
        router.delete(route("friend.destroy", userId), {
            onSuccess: (page) => {
                const { notification } = page.props

                setNotification({
                    type: notification.type,
                    message: notification.message,
                })

                if (notification.statusCode === 200) {
                    setFriends(friends.filter((friend) => friend.id !== userId))
                }
            },
            onError: (errors) => {
                setNotification({
                    type: "error",
                    message: errors?.message || "Failed to remove friend.",
                })
                setTimeout(() => setNotification(null), 5000)
            },
            onFinish: () => {
                setIsProcessing(false)
                setShowConfirmation(false)
            },
        })
    }

    // Handle accept request
    const handleAcceptRequest = (senderId) => {
        setIsProcessing(true)

        router.post(route('relationship.store', senderId), {
                relationshipType: "friends",
            }, {
            onSuccess: (page) => {
                const { notification, friend } = page.props

                setNotification({
                    type: notification.type,
                    message: notification.message,
                })

                if (notification.statusCode == 201 && friend) {
                    console.log(friend)
                    // Add to friends list
                    setFriends((prev) => [friend, ...prev])
                    // Remove from requests
                    setIncomingRequests(incomingRequests.filter((req) => req.id !== senderId))
                }
            },
            onError: (errors) => {
                setNotification({
                    type: "error",
                    message: errors?.message || "Failed to accept friend request.",
                })
                setTimeout(() => setNotification(null), 5000)
            },
            onFinish: () => {
                setIsProcessing(false)
            },
        })
    }

    // Handle reject request
    const handleRejectRequest = (senderId, userName) => {
        setConfirmationData({
            title: "Reject Friend Request",
            message: `Are you sure you want to reject the friend request from ${userName}?`,
            action: () => handleRequestAction(senderId, auth.user.id, "rejection"),
        })
        setShowConfirmation(true)
    }

    // Handle cancel outgoing request
    const handleCancelRequest = (recipientId, userName) => {
        setConfirmationData({
            title: "Cancel Friend Request",
            message: `Are you sure you want to cancel your friend request to ${userName}?`,
            action: () => handleRequestAction(auth.user.id, recipientId, "cancellation"),
        })
        setShowConfirmation(true)
    }

    // Unified method to handle both rejection and cancellation
    const handleRequestAction = (senderId, recipientId, deletionType) => {
        setIsProcessing(true)

        router.delete(route("friend-request.destroy", [senderId, recipientId]), {
            data: {
                deletionType: deletionType,
            },
            onSuccess: (page) => {
                const { notification } = page.props

                setNotification({
                    type: notification.type,
                    message: notification.message,
                })

                if (notification.statusCode === 200) {
                    if (deletionType === "rejection") {
                        setIncomingRequests(incomingRequests.filter((request) => request.id !== senderId))
                    } else if (deletionType === "cancellation") {
                        setOutgoingRequests(outgoingRequests.filter((request) => request.id !== recipientId))
                    }
                }
            },
            onError: (errors) => {
                setNotification({
                    type: "error",
                    message: errors?.message || `Failed to ${deletionType === "rejection" ? "reject" : "cancel"} friend request.`,
                })
                setTimeout(() => setNotification(null), 5000)
            },
            onFinish: () => {
                setIsProcessing(false)
                setShowConfirmation(false)
            },
        })
    }

    // Handle unblock user
    const handleUnblockUser = (userId, userName) => {
        setConfirmationData({
            title: "Unblock User",
            message: `Are you sure you want to unblock ${userName}?`,
            action: () => confirmUnblockUser(userId),
        })
        setShowConfirmation(true)
    }

    // Confirm unblock user
    const confirmUnblockUser = (userId) => {
        setIsProcessing(true)

        router.delete(route("user.unblock", userId), {
            onSuccess: (page) => {
                const { notification } = page.props

                setNotification({
                    type: notification.type,
                    message: notification.message,
                })

                if (notification.statusCode === 200) {
                    setBlockedUsers(blockedUsers.filter((user) => user.id !== userId))
                }
            },
            onError: (errors) => {
                setNotification({
                    type: "error",
                    message: errors?.message || "Failed to unblock user.",
                })
                setTimeout(() => setNotification(null), 5000)
            },
            onFinish: () => {
                setIsProcessing(false)
                setShowConfirmation(false)
            },
        })
    }

    // Handle add friend
    const handleAddFriend = (e) => {
        e.preventDefault()
        if (!friendEmail.trim()) return

        setIsProcessing(true)

        router.post(
            route("friend-request.store"),
            {
                recipientEmail: friendEmail,
            },
            {
                onSuccess: (page) => {
                    const { notification } = page.props

                    setNotification({
                        type: notification.type,
                        message: notification.message,
                    })

                    if (notification.statusCode === 201) {
                        const { friendRequest } = page.props

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

                        // Switch to the outgoing requests tab to show the new request
                        if (activeTab === "requests") {
                            setRequestsSubTab("outgoing")
                        }
                    }

                    setFriendEmail("")
                    setShowAddFriendInput(false)
                    setTimeout(() => setNotification(null), 5000)
                },
                onError: (errors) => {
                    setNotification({
                        type: "error",
                        message: errors?.recipientEmail || `Failed to send friend request.`,
                    })
                    setTimeout(() => setNotification(null), 5000)
                },
                onFinish: () => {
                    setIsProcessing(false)
                },
            },
        )
    }

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="Friends" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header with back button and search/add friend section */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <Link href={route("schedule")} className="mr-4 p-2 hover:bg-gray-100 rounded-full">
                                        <ArrowLeft size={20} />
                                    </Link>
                                    <div className="flex items-center">
                                        <Users size={24} className="text-gray-700 mr-2" />
                                        <h1 className="text-2xl font-semibold text-gray-800">Friends</h1>
                                    </div>
                                </div>

                                {/* Search and Add Friend Section */}
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder={getSearchPlaceholder()}
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value)
                                                // Reset to first page when searching
                                                setCurrentPage({ friends: 1, incoming: 1, outgoing: 1, blocked: 1 })
                                            }}
                                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
                                        />
                                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                    </div>

                                    {showAddFriendInput ? (
                                        <form onSubmit={handleAddFriend} className="flex items-center">
                                            <input
                                                type="email"
                                                placeholder="Enter email address"
                                                value={friendEmail}
                                                onChange={(e) => setFriendEmail(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
                                                required
                                            />
                                            <button
                                                type="submit"
                                                className="ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? "Sending..." : "Send"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddFriendInput(false)}
                                                className="ml-1 p-2 text-gray-500 hover:text-gray-700"
                                            >
                                                <X size={16} />
                                            </button>
                                        </form>
                                    ) : (
                                        <button
                                            onClick={() => setShowAddFriendInput(true)}
                                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            <UserPlus size={16} className="mr-1" />
                                            <span>Add Friend</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Notification message */}
                            {notification && (
                                <div
                                    className={`mb-4 p-3 rounded-lg flex items-center ${
                                        notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    <AlertCircle size={16} className="mr-2" />
                                    <span>{notification.message}</span>
                                    <button onClick={() => setNotification(null)} className="ml-auto text-gray-500 hover:text-gray-700">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            {/* Main Tabs */}
                            <div className="border-b border-gray-200 mb-6">
                                <div className="flex">
                                    <button
                                        onClick={() => handleTabChange("friends")}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === "friends"
                                                ? "border-blue-500 text-blue-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                    >
                                        Friends ({filteredFriends.length})
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleTabChange("requests")
                                            setRequestsSubTab("incoming") // Default to incoming when switching to requests
                                        }}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ml-8 ${
                                            activeTab === "requests"
                                                ? "border-blue-500 text-blue-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                    >
                                        Requests ({filteredIncomingRequests.length + filteredOutgoingRequests.length})
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("blocked")}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ml-auto ${
                                            activeTab === "blocked"
                                                ? "border-blue-500 text-blue-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                    >
                                        Blocked ({filteredBlockedUsers.length})
                                    </button>
                                </div>
                            </div>

                            {/* Friends List */}
                            {activeTab === "friends" && (
                                <div>
                                    {filteredFriends.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            {searchTerm ? "No friends match your search" : "You don't have any friends yet"}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentFriends.map((friend) => (
                                                <div
                                                    key={friend.id}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors relative"
                                                    onMouseEnter={() => setHoveredUser(friend.id)}
                                                    onMouseLeave={() => setHoveredUser(null)}
                                                >
                                                    <div className="flex items-center">
                                                        <div className="relative">
                                                            {friend.avatar ? (
                                                                <img
                                                                    src={friend.avatar || "/placeholder.svg"}
                                                                    alt={friend.name}
                                                                    className="w-12 h-12 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                                    <User size={24} className="text-gray-600" />
                                                                </div>
                                                            )}
                                                            <div
                                                                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                                                                    friend.status,
                                                                )}`}
                                                            ></div>
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="font-medium text-gray-900">{friend.name}</div>
                                                            <div className="text-xs text-gray-500">{`last online ${friend.last_online}`}</div>
                                                        </div>
                                                    </div>

                                                    {/* Action buttons - visible on hover */}
                                                    <div
                                                        className={`flex space-x-2 transition-opacity duration-200 ${
                                                            hoveredUser === friend.id ? "opacity-100" : "opacity-0"
                                                        }`}
                                                    >
                                                        <button
                                                            onClick={() => handleMessageUser(friend.id)}
                                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                            title="Message"
                                                        >
                                                            <MessageSquare size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveFriend(friend.id, friend.name)}
                                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                            title="Remove Friend"
                                                        >
                                                            <UserMinus size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Enhanced Pagination */}
                                    {totalPages.friends > 1 && (
                                        <div className="flex justify-between items-center mt-6">
                                            <div className="text-sm text-gray-700">
                                                Page {currentPage.friends} of {totalPages.friends}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handlePageChange("friends", 1)}
                                                    disabled={currentPage.friends === 1}
                                                    className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="First Page"
                                                >
                                                    <ChevronsLeft size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange("friends", Math.max(1, currentPage.friends - 1))}
                                                    disabled={currentPage.friends === 1}
                                                    className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Previous Page"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handlePageChange("friends", Math.min(totalPages.friends, currentPage.friends + 1))
                                                    }
                                                    disabled={currentPage.friends === totalPages.friends}
                                                    className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Next Page"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange("friends", totalPages.friends)}
                                                    disabled={currentPage.friends === totalPages.friends}
                                                    className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Last Page"
                                                >
                                                    <ChevronsRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Friend Requests */}
                            {activeTab === "requests" && (
                                <div>
                                    {/* Requests Sub-Tabs */}
                                    <div className="mb-4 border-b border-gray-200">
                                        <div className="flex space-x-4">
                                            <button
                                                onClick={() => handleRequestsSubTabChange("incoming")}
                                                className={`py-2 px-4 text-sm font-medium rounded-t-lg ${
                                                    requestsSubTab === "incoming"
                                                        ? "bg-gray-100 border-b-2 border-blue-500 text-blue-600"
                                                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                                }`}
                                            >
                                                Incoming ({filteredIncomingRequests.length})
                                            </button>
                                            <button
                                                onClick={() => handleRequestsSubTabChange("outgoing")}
                                                className={`py-2 px-4 text-sm font-medium rounded-t-lg ${
                                                    requestsSubTab === "outgoing"
                                                        ? "bg-gray-100 border-b-2 border-blue-500 text-blue-600"
                                                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                                                }`}
                                            >
                                                Outgoing ({filteredOutgoingRequests.length})
                                            </button>
                                        </div>
                                    </div>

                                    {/* Incoming Requests */}
                                    {requestsSubTab === "incoming" && (
                                        <>
                                            {filteredIncomingRequests.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    {searchTerm
                                                        ? "No incoming requests match your search"
                                                        : "You don't have any incoming friend requests"}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {currentIncomingRequests.map((request) => (
                                                        <div
                                                            key={request.id}
                                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                                        >
                                                            <div className="flex items-center">
                                                                <div className="relative">
                                                                    {request.avatar ? (
                                                                        <img
                                                                            src={request.avatar || "/placeholder.svg"}
                                                                            alt={request.name}
                                                                            className="w-12 h-12 rounded-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                                            <User size={24} className="text-gray-600" />
                                                                        </div>
                                                                    )}
                                                                    <div
                                                                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                                                                            request.status,
                                                                        )}`}
                                                                    ></div>
                                                                </div>
                                                                <div className="ml-3">
                                                                    <div className="font-medium text-gray-900">{request.name}</div>
                                                                    <div className="text-xs text-gray-500">{`last online ${request.last_online}`}</div>
                                                                    {request.email && <div className="text-xs text-gray-500">{request.email}</div>}
                                                                </div>
                                                            </div>

                                                            {/* Action buttons */}
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleAcceptRequest(request.id)}
                                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                                    title="Accept"
                                                                >
                                                                    <Check size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRejectRequest(request.id, request.name)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                                    title="Reject"
                                                                >
                                                                    <X size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Pagination for Incoming Requests */}
                                            {totalPages.incoming > 1 && (
                                                <div className="flex justify-between items-center mt-6">
                                                    <div className="text-sm text-gray-700">
                                                        Page {currentPage.incoming} of {totalPages.incoming}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handlePageChange("incoming", 1)}
                                                            disabled={currentPage.incoming === 1}
                                                            className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="First Page"
                                                        >
                                                            <ChevronsLeft size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePageChange("incoming", Math.max(1, currentPage.incoming - 1))}
                                                            disabled={currentPage.incoming === 1}
                                                            className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Previous Page"
                                                        >
                                                            <ChevronLeft size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handlePageChange("incoming", Math.min(totalPages.incoming, currentPage.incoming + 1))
                                                            }
                                                            disabled={currentPage.incoming === totalPages.incoming}
                                                            className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Next Page"
                                                        >
                                                            <ChevronRight size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePageChange("incoming", totalPages.incoming)}
                                                            disabled={currentPage.incoming === totalPages.incoming}
                                                            className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Last Page"
                                                        >
                                                            <ChevronsRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Outgoing Requests */}
                                    {requestsSubTab === "outgoing" && (
                                        <>
                                            {filteredOutgoingRequests.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    {searchTerm
                                                        ? "No outgoing requests match your search"
                                                        : "You don't have any outgoing friend requests"}
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {currentOutgoingRequests.map((request) => (
                                                        <div
                                                            key={request.id}
                                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                                            onMouseEnter={() => setHoveredUser(request.id)}
                                                            onMouseLeave={() => setHoveredUser(null)}
                                                        >
                                                            <div className="flex items-center">
                                                                <div className="relative">
                                                                    {request.avatar ? (
                                                                        <img
                                                                            src={request.avatar || "/placeholder.svg"}
                                                                            alt={request.name}
                                                                            className="w-12 h-12 rounded-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                                            <User size={24} className="text-gray-600" />
                                                                        </div>
                                                                    )}
                                                                    <div
                                                                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                                                                            request.status,
                                                                        )}`}
                                                                    ></div>
                                                                </div>
                                                                <div className="ml-3">
                                                                    <div className="font-medium text-gray-900">{request.name}</div>
                                                                    <div className="text-xs text-gray-500">
                                                                    </div>
                                                                    {request.email && <div className="text-xs text-gray-500">{request.email}</div>}
                                                                </div>
                                                            </div>

                                                            {/* Cancel button */}
                                                            <button
                                                                onClick={() => handleCancelRequest(request.id, request.name)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                                title="Cancel Request"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Pagination for Outgoing Requests */}
                                            {totalPages.outgoing > 1 && (
                                                <div className="flex justify-between items-center mt-6">
                                                    <div className="text-sm text-gray-700">
                                                        Page {currentPage.outgoing} of {totalPages.outgoing}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handlePageChange("outgoing", 1)}
                                                            disabled={currentPage.outgoing === 1}
                                                            className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="First Page"
                                                        >
                                                            <ChevronsLeft size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePageChange("outgoing", Math.max(1, currentPage.outgoing - 1))}
                                                            disabled={currentPage.outgoing === 1}
                                                            className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Previous Page"
                                                        >
                                                            <ChevronLeft size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handlePageChange("outgoing", Math.min(totalPages.outgoing, currentPage.outgoing + 1))
                                                            }
                                                            disabled={currentPage.outgoing === totalPages.outgoing}
                                                            className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Next Page"
                                                        >
                                                            <ChevronRight size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handlePageChange("outgoing", totalPages.outgoing)}
                                                            disabled={currentPage.outgoing === totalPages.outgoing}
                                                            className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Last Page"
                                                        >
                                                            <ChevronsRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                            {/* Blocked Users Tab */}
                            {activeTab === "blocked" && (
                                <div>
                                    {filteredBlockedUsers.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            {searchTerm ? "No blocked users match your search" : "You haven't blocked any users yet."}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentBlockedUsers.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                                >
                                                    <div className="flex items-center">
                                                        <div className="relative">
                                                            {user.avatar ? (
                                                                <img
                                                                    src={user.avatar || "/placeholder.svg"}
                                                                    alt={user.name}
                                                                    className="w-12 h-12 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                                                    <User size={24} className="text-gray-600" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="font-medium text-gray-900">{user.name}</div>
                                                            {user.last_online && <div className="text-xs text-gray-500">{`last_online ${user.last_online}`}</div>}
                                                        </div>
                                                    </div>

                                                    {/* Unblock button */}
                                                    <button
                                                        onClick={() => handleUnblockUser(user.id, user.name)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                                        title="Unblock User"
                                                    >
                                                        <Check size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Pagination for Blocked Users */}
                                    {totalPages.blocked > 1 && (
                                        <div className="flex justify-between items-center mt-6">
                                            <div className="text-sm text-gray-700">
                                                Page {currentPage.blocked} of {totalPages.blocked}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handlePageChange("blocked", 1)}
                                                    disabled={currentPage.blocked === 1}
                                                    className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="First Page"
                                                >
                                                    <ChevronsLeft size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange("blocked", Math.max(1, currentPage.blocked - 1))}
                                                    disabled={currentPage.blocked === 1}
                                                    className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Previous Page"
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handlePageChange("blocked", Math.min(totalPages.blocked, currentPage.blocked + 1))
                                                    }
                                                    disabled={currentPage.blocked === totalPages.blocked}
                                                    className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Next Page"
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handlePageChange("blocked", totalPages.blocked)}
                                                    disabled={currentPage.blocked === totalPages.blocked}
                                                    className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Last Page"
                                                >
                                                    <ChevronsRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
                isProcessing={isProcessing}
            />
        </AuthenticatedLayout>
    )
}
