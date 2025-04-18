"use client"

import { useState, useEffect, useRef } from "react"
import { X, Check, Clock } from "lucide-react"

export default function DayTasksModal({ day, onTaskClick, onClose }) {
    const [activeTab, setActiveTab] = useState("standalone")
    const [timeLeftMap, setTimeLeftMap] = useState({})
    const modalRef = useRef(null)

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [onClose])

    // Update time left for tasks due today
    useEffect(() => {
        const today = new Date()
        const isToday =
            day.date.getDate() === today.getDate() &&
            day.date.getMonth() === today.getMonth() &&
            day.date.getFullYear() === today.getFullYear()

        if (!isToday) return

        const allTasks = [...day.standaloneTasks, ...day.routineTasks]
        const uncompletedTasks = allTasks.filter((task) => !task.completed && task.dueTime)

        if (uncompletedTasks.length === 0) return

        const updateTimesLeft = () => {
            const newTimeLeftMap = {}

            uncompletedTasks.forEach((task) => {
                const now = new Date()
                const dueTime = task.dueTime

                if (!dueTime) return

                const diffMs = dueTime - now

                if (diffMs <= 0) {
                    newTimeLeftMap[task.id] = "Overdue"
                    return
                }

                const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
                const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000)

                if (diffHrs > 0) {
                    newTimeLeftMap[task.id] = `${diffHrs}h ${diffMins}m left`
                } else if (diffMins > 0) {
                    newTimeLeftMap[task.id] = `${diffMins}m ${diffSecs}s left`
                } else {
                    newTimeLeftMap[task.id] = `${diffSecs}s left`
                }
            })

            setTimeLeftMap(newTimeLeftMap)
        }

        updateTimesLeft()
        const interval = setInterval(updateTimesLeft, 1000)

        return () => clearInterval(interval)
    }, [day])

    const formatDate = (date) => {
        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    const getDayName = (date) => {
        return date.toLocaleDateString("en-US", { weekday: "long" })
    }

    const getImportanceColor = (importance) => {
        switch (importance) {
            case 1:
                return "bg-red-500" // High
            case 2:
                return "bg-yellow-500" // Medium
            case 3:
                return "bg-green-500" // Low
            default:
                return "bg-gray-500"
        }
    }

    const getImportanceLabel = (importance) => {
        switch (importance) {
            case 1:
                return "High"
            case 2:
                return "Medium"
            case 3:
                return "Low"
            default:
                return "Medium"
        }
    }

    // Check if a date is today
    const isToday = (date) => {
        const today = new Date()
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold">
                        {formatDate(day.date)} - {getDayName(day.date)}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-3 font-medium text-center transition-colors ${
                            activeTab === "standalone" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                        }`}
                        onClick={() => setActiveTab("standalone")}
                    >
                        Standalone Tasks ({day.standaloneTasks.length})
                    </button>
                    <button
                        className={`flex-1 py-3 font-medium text-center transition-colors ${
                            activeTab === "routine" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:bg-gray-50"
                        }`}
                        onClick={() => setActiveTab("routine")}
                    >
                        Routine Tasks ({day.routineTasks.length})
                    </button>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {activeTab === "standalone" ? (
                        <>
                            {day.standaloneTasks.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No standalone tasks for this day</div>
                            ) : (
                                <div className="space-y-3">
                                    {day.standaloneTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                                            onClick={() => onTaskClick(task, day.date)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="font-medium">{task.title}</div>
                                                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</div>

                                                    {/* Time left countdown for today's tasks */}
                                                    {isToday(day.date) && !task.completed && timeLeftMap[task.id] && (
                                                        <div className="flex items-center mt-1 text-xs font-medium text-yellow-700">
                                                            <Clock size={12} className="mr-1" />
                                                            {timeLeftMap[task.id]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end ml-4">
                                                    <div className="flex items-center">
                                                        <div className={`w-3 h-3 rounded-full ${getImportanceColor(task.importance)}`}></div>
                                                        <span className="ml-1 text-xs font-medium">{getImportanceLabel(task.importance)}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">{task.time}</div>
                                                    {task.completed && (
                                                        <div className="flex items-center text-green-600 text-xs mt-1">
                                                            <Check size={12} className="mr-1" />
                                                            Completed
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {day.routineTasks.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No routine tasks for this day</div>
                            ) : (
                                <div className="space-y-3">
                                    {day.routineTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
                                            onClick={() => onTaskClick(task, day.date)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="font-medium">{task.title}</div>
                                                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</div>

                                                    {/* Time left countdown for today's tasks */}
                                                    {isToday(day.date) && !task.completed && timeLeftMap[task.id] && (
                                                        <div className="flex items-center mt-1 text-xs font-medium text-yellow-700">
                                                            <Clock size={12} className="mr-1" />
                                                            {timeLeftMap[task.id]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end ml-4">
                                                    <div className="flex items-center">
                                                        <div className={`w-3 h-3 rounded-full ${getImportanceColor(task.importance)}`}></div>
                                                        <span className="ml-1 text-xs font-medium">{getImportanceLabel(task.importance)}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">{task.time}</div>
                                                    {task.completed && (
                                                        <div className="flex items-center text-green-600 text-xs mt-1">
                                                            <Check size={12} className="mr-1" />
                                                            Completed
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
