"use client"

import { useEffect, useState } from "react"
import { Head, router } from "@inertiajs/react"
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

export default function Friends({ auth }) {
    const [activeTab, setActiveTab] = useState("friends")
    const [requestsSubTab, setRequestsSubTab] = useState("incoming") // New state for requests sub-tab
    const [currentPage, setCurrentPage] = useState({ friends: 1, incoming: 1, outgoing: 1 }) // Updated for sub-tabs
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

    // Friends and requests state
    const [friends, setFriends] = useState([
        { id: 1, name: "John Doe", status: "online", avatar: null, lastActive: "Just now" },
        { id: 2, name: "Sarah Wilson", status: "online", avatar: null, lastActive: "Just now" },
        { id: 3, name: "Mike Johnson", status: "away", avatar: null, lastActive: "5m ago" },
        { id: 4, name: "Lisa Brown", status: "offline", avatar: null, lastActive: "1h ago" },
        { id: 5, name: "Alex Smith", status: "online", avatar: null, lastActive: "Just now" },
        { id: 6, name: "Emily Davis", status: "offline", avatar: null, lastActive: "3h ago" },
        { id: 7, name: "Chris Wilson", status: "online", avatar: null, lastActive: "Just now" },
        { id: 8, name: "Jessica Taylor", status: "away", avatar: null, lastActive: "10m ago" },
        { id: 9, name: "David Miller", status: "online", avatar: null, lastActive: "Just now" },
        { id: 10, name: "Amanda White", status: "offline", avatar: null, lastActive: "2h ago" },
        { id: 11, name: "Robert Johnson", status: "away", avatar: null, lastActive: "15m ago" },
        { id: 12, name: "Sophia Martinez", status: "online", avatar: null, lastActive: "Just now" },
        { id: 13, name: "Daniel Thompson", status: "offline", avatar: null, lastActive: "1d ago" },
        { id: 14, name: "Olivia Garcia", status: "online", avatar: null, lastActive: "Just now" },
        { id: 15, name: "William Brown", status: "away", avatar: null, lastActive: "30m ago" },
    ])

    // Separate incoming and outgoing friend requests
    const [incomingRequests, setIncomingRequests] = useState([
        { id: 101, name: "Emma Wilson", status: "online", avatar: null, lastActive: "Just now" },
        { id: 102, name: "Noah Martinez", status: "offline", avatar: null, lastActive: "2h ago" },
        { id: 103, name: "Ava Johnson", status: "away", avatar: null, lastActive: "15m ago" },
        { id: 104, name: "Liam Smith", status: "online", avatar: null, lastActive: "Just now" },
        { id: 105, name: "Isabella Brown", status: "offline", avatar: null, lastActive: "1d ago" },
    ])

    const [outgoingRequests, setOutgoingRequests] = useState([
        {
            id: 106,
            name: "Mason Davis",
            status: "online",
            avatar: null,
            lastActive: "Just now",
            email: "mason@example.com",
        },
        {
            id: 107,
            name: "Sophia Miller",
            status: "away",
            avatar: null,
            lastActive: "30m ago",
            email: "sophia@example.com",
        },
        {
            id: 108,
            name: "Jacob Garcia",
            status: "online",
            avatar: null,
            lastActive: "Just now",
            email: "jacob@example.com",
        },
        {
            id: 109,
            name: "Olivia Taylor",
            status: "offline",
            avatar: null,
            lastActive: "3h ago",
            email: "olivia@example.com",
        },
        {
            id: 110,
            name: "Ethan Anderson",
            status: "online",
            avatar: null,
            lastActive: "Just now",
            email: "ethan@example.com",
        },
    ])

    // Listen for real-time friend request updates using Pusher
    useEffect(() => {
        console.log("effect_triggered")
        const currentUserId = auth.user.id;

        // Set up Pusher channel for friend requests
        const channel = window.Echo.private(`friend-requests.${currentUserId}`)

        console.log("channel made: ", channel)

        // Listen for new friend requests
        channel.listen(".NewFriendRequest", (senderInfo) => {
            const { requestId, senderId, name, status, avatar, lastOnline, email } = senderInfo;

            console.log("listener triggered, request id: ", requestId)

            const newRequest = {
                id        : requestId,
                senderId  : senderId,
                name      : name,
                status    : status,
                avatar    : avatar,
                lastActive: lastOnline,
                email     : email,
            }

            console.log("new request: ", newRequest)

            setIncomingRequests((prev) => [newRequest, ...prev])

            console.log("incomingRequestsSet");

            // Show notification
            setNotification({
                type   : "success",
                message: `New friend request from ${senderInfo.name}`,
            })

            console.log("notificationSet")

            setTimeout(() => setNotification(null), 5000)
        })

        // // Listen for friend request accepted events
        // channel.listen("FriendRequestAccepted", (data) => {
        //     // Add to friends list
        //     const newFriend = {
        //         id: data.user.id,
        //         name: data.user.name,
        //         status: "online", // Default status
        //         avatar: data.user.avatar,
        //         lastActive: "Just now",
        //     }
        //
        //     setFriends((prev) => [newFriend, ...prev])
        //
        //     // Remove from outgoing requests
        //     setOutgoingRequests((prev) => prev.filter((request) => request.email !== data.user.email))
        //
        //     // Show notification
        //     setNotification({
        //         type: "success",
        //         message: `${data.user.name} accepted your friend request`,
        //     })
        //
        //     setTimeout(() => setNotification(null), 5000)
        // })
        //
        // Listen for friend request rejected/canceled events
        channel.listen(".RemovedFriendRequest", (removalData) => {

            console.log("made it errrrrrrrrrrrre, removal data: ", removalData)

            console.log("req id is: ", removalData)

            if(removalData.deletionType === "rejection") {
                // Remove from outgoing requests
                setOutgoingRequests((prev) => prev.filter((request) => request.id !== removalData.requestId))

                setNotification({
                    type: "error",
                    message: `${removalData.recipientName} declined your friend request`,
                })
            }

            if(removalData.deletionType === "cancellation") {
                console.log("made itttttt")
                setIncomingRequests((prev) => prev.filter((request) => request.id !== removalData.requestId))
            }

            setTimeout(() => setNotification(null), 5000)
        })

        // Cleanup function
        return () => {
            channel.stopListening("NewFriendRequest")
            // channel.stopListening("FriendRequestAccepted")
            channel.stopListening("FriendRequestRejected")
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

    // Calculate total pages
    const totalPages = {
        friends: Math.ceil(filteredFriends.length / itemsPerPage),
        incoming: Math.ceil(filteredIncomingRequests.length / itemsPerPage),
        outgoing: Math.ceil(filteredOutgoingRequests.length / itemsPerPage),
    }

    // Get current items
    const getCurrentItems = (items, page) => {
        const startIndex = (page - 1) * itemsPerPage
        return items.slice(startIndex, startIndex + itemsPerPage)
    }

    const currentFriends = getCurrentItems(filteredFriends, currentPage.friends)
    const currentIncomingRequests = getCurrentItems(filteredIncomingRequests, currentPage.incoming)
    const currentOutgoingRequests = getCurrentItems(filteredOutgoingRequests, currentPage.outgoing)

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

    // Handle message user
    const handleMessageUser = (userId) => {
        // In a real app, this would navigate to the chat with this user
        console.log(`Navigate to chat with user ${userId}`)
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
        // Simulate API call
        setTimeout(() => {
            setFriends(friends.filter((friend) => friend.id !== userId))
            setIsProcessing(false)
            setShowConfirmation(false)
        }, 1000)
    }

    // Handle accept request
    const handleAcceptRequest = (userId) => {
        setIsProcessing(true)
        // Simulate API call
        setTimeout(() => {
            const request = incomingRequests.find((req) => req.id === userId)
            if (request) {
                // Add to friends list with a new ID
                setFriends([...friends, { ...request, id: friends.length + 1 }])
                // Remove from requests
                setIncomingRequests(incomingRequests.filter((req) => req.id !== userId))
            }
            setIsProcessing(false)
        }, 1000)
    }

    // Handle reject request
    const handleRejectRequest = (requestId, userName) => {
        setConfirmationData({
            title: "Reject Friend Request",
            message: `Are you sure you want to reject the friend request from ${userName}?`,
            action: () => confirmRejectRequest(requestId),
        })
        setShowConfirmation(true)
    }

    // Confirm reject request
    const confirmRejectRequest = (requestId) => {
        setIsProcessing(true)

        console.log("request id for deletion issss: ", requestId);

        router.delete(route('request.destroy', requestId), {
            data: {
                deletionType: "rejection"
            },
            onSuccess: (page) => {
                const { notification } = page.props;

                console.log('notiii: ' + notification);

                setNotification({
                    type   : notification.type,
                    message: notification.message
                })

                console.log('set notiiii')

                notification.statusCode === 200 &&
                setIncomingRequests(incomingRequests.filter((request) => request.id !== requestId));

                console.log('madeToEndOf onsuccess')

            },
            onError: (errors) => {
                console.log('didnt make it cuh')
                setNotification({
                    type: "error",
                    message: errors?.recipientEmail || `Failed to reject friend request.`,
                })
                setTimeout(() => setNotification(null), 5000)
            },
            onFinish: () => {
                console.log('finisheddddd')

                setIsProcessing(false)
                setShowConfirmation(false)
            },
        })
    }

    // Handle cancel outgoing request
    const handleCancelRequest = (requestId, userName) => {

        setConfirmationData({
            title: "Cancel Friend Request",
            message: `Are you sure you want to cancel your friend request to ${userName}?`,
            action: () => confirmCancelRequest(requestId),
        })
        setShowConfirmation(true)
    }

    // Confirm cancel outgoing request
    const confirmCancelRequest = (requestId) => {
        setIsProcessing(true)

        console.log("request id for deletion is: ", requestId);

        router.delete(route('request.destroy', requestId), {
            data: {
                deletionType: "cancellation"
            },
            onSuccess: (page) => {
                const { notification } = page.props;

                setNotification({
                    type   : notification.type,
                    message: notification.message
                })

                notification.statusCode === 200 &&
                    setOutgoingRequests(outgoingRequests.filter((request) => request.id !== requestId));

            },
            onError: (errors) => {
                setNotification({
                    type: "error",
                    message: errors?.recipientEmail || `Failed to remove friend request.`,
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
            window.route("request.store"),
            {
                requestType: "friend",
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
                        const { request } = page.props

                        const { requestId, recipientName, recipientStatus, recipientAvatar, recipientLastOnline } = request;

                        const newOutgoingRequest = {
                            id        : requestId,
                            name      : recipientName,
                            email     : friendEmail,
                            status    : recipientStatus,
                            avatar    : recipientAvatar,
                            lastActive: recipientLastOnline,
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
                                            placeholder="Search friends..."
                                            value={searchTerm}
                                            onChange={(e) => {
                                                setSearchTerm(e.target.value)
                                                // Reset to first page when searching
                                                setCurrentPage({ friends: 1, incoming: 1, outgoing: 1 })
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
                                <div className="flex space-x-8">
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
                                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === "requests"
                                                ? "border-blue-500 text-blue-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                        }`}
                                    >
                                        Requests ({filteredIncomingRequests.length + filteredOutgoingRequests.length})
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
                                                            <div className="text-xs text-gray-500">{friend.lastActive}</div>
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
                                                                    <div className="text-xs text-gray-500">{request.lastActive}</div>
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
