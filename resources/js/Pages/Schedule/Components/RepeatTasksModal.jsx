"use client"

import { useState, useEffect, useRef } from "react"
import { X, Calendar, Clock, Trash2, AlertCircle, Search } from "lucide-react"
import { usePage } from "@inertiajs/react"

export default function RepeatTasksModal({ onClose }) {
    const [repeatTasks, setRepeatTasks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedTask, setSelectedTask] = useState(null)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterImportance, setFilterImportance] = useState("all")
    const modalRef = useRef(null)
    const { route } = usePage().props

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        // Fetch repeating tasks
        fetchRepeatTasks()

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [onClose, route])

    const fetchRepeatTasks = async () => {
        try {
            // Simulate API call with mock data
            setTimeout(() => {
                const mockTasks = [
                    {
                        id: 1,
                        title: "Team Weekly Meeting",
                        description: "Discuss project progress and upcoming tasks",
                        importance: "high",
                        due: "2023-05-01T10:00:00",
                        routine: JSON.stringify({ type: "weekly", days: [1] }),
                    },
                    {
                        id: 2,
                        title: "Daily Standup",
                        description: "Quick team check-in",
                        importance: "medium",
                        due: "2023-05-01T09:30:00",
                        routine: JSON.stringify({ type: "daily" }),
                    },
                    {
                        id: 3,
                        title: "Monthly Report",
                        description: "Prepare monthly progress report",
                        importance: "high",
                        due: "2023-05-01T14:00:00",
                        routine: JSON.stringify({ type: "monthly", dayOfMonth: 1 }),
                    },
                    {
                        id: 4,
                        title: "Code Review",
                        description: "Review pull requests",
                        importance: "medium",
                        due: "2023-05-01T15:00:00",
                        routine: JSON.stringify({ type: "weekly", days: [2, 4] }),
                    },
                    {
                        id: 5,
                        title: "Backup Database",
                        description: "Run weekly database backup",
                        importance: "low",
                        due: "2023-05-01T23:00:00",
                        routine: JSON.stringify({ type: "weekly", days: [0] }),
                    },
                ]
                setRepeatTasks(mockTasks)
                setIsLoading(false)
            }, 800)
        } catch (error) {
            console.error("Failed to fetch repeating tasks:", error)
            setIsLoading(false)
        }
    }

    const handleStopRepetition = (taskId) => {
        setSelectedTask(taskId)
        setShowConfirmation(true)
    }

    const confirmStopRepetition = () => {
        if (!selectedTask) return

        // Simulate API call
        setRepeatTasks(repeatTasks.filter((task) => task.id !== selectedTask))
        setShowConfirmation(false)
        setSelectedTask(null)
    }

    const getImportanceColor = (importance) => {
        switch (importance) {
            case "high":
                return "bg-red-500" // High
            case "medium":
                return "bg-yellow-500" // Medium
            case "low":
                return "bg-green-500" // Low
            default:
                return "bg-gray-500"
        }
    }

    const formatRepeatPattern = (routine) => {
        if (!routine) return "Unknown pattern"

        try {
            const pattern = typeof routine === "string" ? JSON.parse(routine) : routine

            if (pattern.type === "daily") {
                return "Every day"
            } else if (pattern.type === "weekly") {
                const days = pattern.days || []
                if (days.length === 7) return "Every day"

                const dayMap = {
                    0: "Sun",
                    1: "Mon",
                    2: "Tue",
                    3: "Wed",
                    4: "Thu",
                    5: "Fri",
                    6: "Sat",
                }
                const dayNames = days.map((day) => dayMap[day] || day)

                return `Weekly on ${dayNames.join(", ")}`
            } else if (pattern.type === "monthly") {
                return `Monthly on day ${pattern.dayOfMonth}`
            }

            return JSON.stringify(pattern)
        } catch (e) {
            return "Invalid pattern"
        }
    }

    // Filter tasks based on search and importance
    const filteredTasks = repeatTasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesImportance = filterImportance === "all" || task.importance === filterImportance

        return matchesSearch && matchesImportance
    })

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold">Repeating Tasks</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    {/* Search and Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search repeating tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Filter:</span>
                            <select
                                value={filterImportance}
                                onChange={(e) => setFilterImportance(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredTasks.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <div className="flex justify-center mb-4">
                                    <Calendar size={48} className="text-gray-300" />
                                </div>
                                <p>
                                    {searchTerm || filterImportance !== "all"
                                        ? "No matching repeating tasks found"
                                        : "You don't have any repeating tasks"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <div className={`w-3 h-3 rounded-full ${getImportanceColor(task.importance)} mr-2`}></div>
                                                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                                                </div>

                                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>

                                                <div className="mt-3 flex flex-wrap gap-3">
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Clock size={14} className="mr-1" />
                                                        {new Date(task.due).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    </div>

                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Calendar size={14} className="mr-1" />
                                                        {formatRepeatPattern(task.routine)}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleStopRepetition(task.id)}
                                                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                title="Stop Repetition"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Confirmation Dialog */}
                {showConfirmation && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center text-amber-600 mb-4">
                                <AlertCircle size={24} className="mr-2" />
                                <h3 className="text-lg font-medium">Stop Task Repetition</h3>
                            </div>

                            <p className="text-gray-700 mb-6">
                                Are you sure you want to stop this task from repeating? This action cannot be undone.
                            </p>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmStopRepetition}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                >
                                    Stop Repetition
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
