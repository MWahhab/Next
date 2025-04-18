"use client"

import { useState } from "react"
import { Users, User, Circle } from "lucide-react"

export default function RightSidebar() {
    const [friends, setFriends] = useState([
        { id: 1, name: "John Doe", status: "online", lastActive: "Just now" },
        { id: 2, name: "Sarah Wilson", status: "online", lastActive: "Just now" },
        { id: 3, name: "Mike Johnson", status: "away", lastActive: "5m ago" },
        { id: 4, name: "Lisa Brown", status: "offline", lastActive: "1h ago" },
        { id: 5, name: "Alex Smith", status: "online", lastActive: "Just now" },
        { id: 6, name: "Emily Davis", status: "offline", lastActive: "3h ago" },
        { id: 7, name: "Chris Wilson", status: "online", lastActive: "Just now" },
        { id: 8, name: "Jessica Taylor", status: "away", lastActive: "10m ago" },
    ])

    const groupChats = [
        { id: 1, name: "Team Alpha", members: 5, active: true },
        { id: 2, name: "Project X", members: 8, active: false },
        { id: 3, name: "Design Team", members: 4, active: true },
        { id: 4, name: "Marketing", members: 6, active: false },
        { id: 5, name: "Development", members: 10, active: true },
        { id: 6, name: "HR Department", members: 3, active: false },
        { id: 7, name: "Sales Team", members: 7, active: true },
        { id: 8, name: "Customer Support", members: 9, active: false },
        { id: 9, name: "Executive Board", members: 4, active: true },
        { id: 10, name: "New Hires", members: 12, active: false },
    ]

    const getStatusColor = (status) => {
        switch (status) {
            case "online":
                return "bg-green-500"
            case "away":
                return "bg-yellow-500"
            case "offline":
                return "bg-gray-300"
            default:
                return "bg-gray-300"
        }
    }

    const handleChatClick = (chatId) => {
        window.location.href = `/chat/${chatId}`
    }

    return (
        <div className="w-64 bg-white border-l border-gray-200 hidden lg:flex lg:flex-col h-full">
            {/* Friends Section */}
            <div className="flex flex-col h-1/2 min-h-0">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-lg flex items-center">
                        <User size={18} className="mr-2" />
                        Friends
                    </h2>
                </div>

                <div className="overflow-y-auto flex-1">
                    {friends.map((friend) => (
                        <div
                            key={friend.id}
                            className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleChatClick(friend.id)}
                        >
                            <div className="flex items-center">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User size={18} className="text-gray-600" />
                                    </div>
                                    <div
                                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                                            friend.status,
                                        )}`}
                                    ></div>
                                </div>
                                <div className="ml-3">
                                    <div className="font-medium">{friend.name}</div>
                                    <div className="text-xs text-gray-500 flex items-center">
                                        <span>{friend.lastActive}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Group Chats Section */}
            <div className="flex flex-col h-1/2 min-h-0">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-semibold text-lg flex items-center">
                        <Users size={18} className="mr-2" />
                        Group Chats
                    </h2>
                </div>

                <div className="overflow-y-auto flex-1">
                    {groupChats.map((group) => (
                        <div
                            key={group.id}
                            className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleChatClick(group.id)}
                        >
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users size={18} className="text-blue-600" />
                                </div>
                                <div className="ml-3">
                                    <div className="font-medium">{group.name}</div>
                                    <div className="text-xs text-gray-500 flex items-center">
                                        <span>{group.members} members</span>
                                        <span className="ml-2 flex items-center">
                      <Circle
                          size={8}
                          className={`mr-1 ${group.active ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300"}`}
                      />
                                            {group.active ? "Active" : "Inactive"}
                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
