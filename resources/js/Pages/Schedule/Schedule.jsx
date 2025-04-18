"use client"

import { useState, useEffect } from "react"
import { Head } from "@inertiajs/react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Calendar, ChevronLeft, ChevronRight, Bell, Plus, X } from "lucide-react"
import DayWidget from "@/Pages/Schedule/Components/DayWidget"
import TaskModal from "@/Pages/Schedule/Components/TaskModal"
import TaskViewModal from "@/Pages/Schedule/Components/TaskViewModal"
import DayTasksModal from "@/Pages/Schedule/Components/DayTasksModal"
import DatePicker from "@/Pages/Schedule/Components/DatePicker"

export default function Schedule({ auth }) {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [showTaskViewModal, setShowTaskViewModal] = useState(false)
    const [showDayTasksModal, setShowDayTasksModal] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [selectedDay, setSelectedDay] = useState(null)
    const [days, setDays] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [notificationRef, setNotificationRef] = useState(null)
    const [notificationCount, setNotificationCount] = useState(3) // Example notification count

    // Generate some dummy days with tasks
    useEffect(() => {
        const dummyDays = []
        const today = new Date()

        // Generate 25 day widgets (5x5 grid)
        for (let i = 0; i < 25; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + Math.floor(i / 5))

            // Generate random due times for today's tasks
            const generateDueTime = () => {
                const now = new Date()
                const dueTime = new Date(now)

                // Random time between now and end of day
                const hoursLeft = 23 - now.getHours()
                const minutesLeft = 59 - now.getMinutes()

                const randomHours = Math.floor(Math.random() * hoursLeft)
                const randomMinutes = Math.floor(Math.random() * minutesLeft)

                dueTime.setHours(now.getHours() + randomHours)
                dueTime.setMinutes(now.getMinutes() + randomMinutes)

                return dueTime
            }

            // Check if this day is today
            const isToday =
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()

            dummyDays.push({
                id: i + 1,
                date: date,
                standaloneTasks: [
                    {
                        id: `s${i}-1`,
                        title: `Standalone Task ${i + 1}`,
                        importance: Math.floor(Math.random() * 3) + 1, // 1: high (red), 2: medium (yellow), 3: low (green)
                        description: "Task description here",
                        time: "10:00 AM",
                        completed: Math.random() > 0.7,
                        dueTime: isToday ? generateDueTime() : null,
                    },
                    {
                        id: `s${i}-2`,
                        title: `Meeting ${i + 1}`,
                        importance: Math.floor(Math.random() * 3) + 1,
                        description: "Meeting with team",
                        time: "2:00 PM",
                        completed: Math.random() > 0.7,
                        dueTime: isToday ? generateDueTime() : null,
                    },
                ],
                routineTasks: [
                    {
                        id: `r${i}-1`,
                        title: `Daily Routine ${i + 1}`,
                        importance: Math.floor(Math.random() * 3) + 1,
                        description: "Regular task",
                        time: "9:00 AM",
                        completed: Math.random() > 0.5,
                        dueTime: isToday ? generateDueTime() : null,
                    },
                    {
                        id: `r${i}-2`,
                        title: `Weekly Check ${i + 1}`,
                        importance: Math.floor(Math.random() * 3) + 1,
                        description: "Weekly status update",
                        time: "4:00 PM",
                        completed: Math.random() > 0.5,
                        dueTime: isToday ? generateDueTime() : null,
                    },
                ],
            })
        }

        setDays(dummyDays)
    }, [])

    // Listen for custom event to open task modal
    useEffect(() => {
        const handleOpenTaskModal = () => setShowTaskModal(true)
        window.addEventListener("open-task-modal", handleOpenTaskModal)

        return () => {
            window.removeEventListener("open-task-modal", handleOpenTaskModal)
        }
    }, [])

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef && !notificationRef.contains(event.target) && showNotifications) {
                setShowNotifications(false)
            }
        }

        if (showNotifications) {
            document.addEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showNotifications, notificationRef])

    const handleDayClick = (day) => {
        setSelectedDay(day)
        setShowDayTasksModal(true)
    }

    const handleTaskClick = (task, dayDate) => {
        // Create a full task object with all necessary details
        const fullTask = {
            ...task,
            date: dayDate,
            people: [
                { id: 1, name: "John Doe", status: "accepted" },
                { id: 2, name: "Sarah Wilson", status: "pending" },
                { id: 3, name: "Mike Johnson", status: "declined" },
                { id: 4, name: "Lisa Brown", status: "accepted" },
            ],
            comments: [
                { id: 1, user: "Sarah Wilson", text: "I'll prepare the presentation slides", time: "2 hours ago" },
                { id: 2, user: "John Doe", text: "Great, I'll handle the meeting notes", time: "1 hour ago" },
            ],
        }

        setSelectedTask(fullTask)
        setShowTaskViewModal(true)
        setShowDayTasksModal(false)
    }

    const handleBackToDayView = () => {
        setShowTaskViewModal(false)
        setShowDayTasksModal(true)
    }

    const handlePrevDay = () => {
        const newDate = new Date(selectedDate)
        newDate.setDate(selectedDate.getDate() - 1)
        setSelectedDate(newDate)
    }

    const handleNextDay = () => {
        const newDate = new Date(selectedDate)
        newDate.setDate(selectedDate.getDate() + 1)
        setSelectedDate(newDate)
    }

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

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="Schedule" />

            <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center">
                    <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-gray-200">
                        <ChevronLeft size={20} />
                    </button>
                    <div
                        className="mx-2 px-4 py-2 bg-white rounded-lg shadow cursor-pointer flex items-center"
                        onClick={() => setShowDatePicker(true)}
                    >
                        <Calendar size={18} className="mr-2 text-gray-600" />
                        <span className="font-medium">{formatDate(selectedDate)}</span>
                        <span className="ml-2 text-gray-600">{getDayName(selectedDate)}</span>
                    </div>
                    <button onClick={handleNextDay} className="p-2 rounded-full hover:bg-gray-200">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Action Buttons (Moved to Schedule component) */}
                <div className="flex items-center space-x-3">
                    {/* Add Task Button */}
                    <button
                        onClick={() => setShowTaskModal(true)}
                        className="bg-gray-900 text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors"
                        title="Add New Task"
                    >
                        <Plus size={20} />
                    </button>

                    {/* Notification Bell with Counter */}
                    <div className="relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowNotifications(!showNotifications)
                            }}
                            className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            title="Notifications"
                        >
                            <Bell size={20} />
                        </button>
                        {notificationCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {notificationCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {days.map((day) => (
                    <DayWidget key={day.id} day={day} onClick={() => handleDayClick(day)} />
                ))}
            </div>

            {/* Task Creation Modal */}
            {showTaskModal && <TaskModal onClose={() => setShowTaskModal(false)} />}

            {/* Day Tasks Modal */}
            {showDayTasksModal && selectedDay && (
                <DayTasksModal day={selectedDay} onTaskClick={handleTaskClick} onClose={() => setShowDayTasksModal(false)} />
            )}

            {/* Task View Modal */}
            {showTaskViewModal && selectedTask && (
                <TaskViewModal
                    task={selectedTask}
                    onClose={() => setShowTaskViewModal(false)}
                    onBackToDayView={handleBackToDayView}
                />
            )}

            {/* Date Picker Modal */}
            {showDatePicker && (
                <DatePicker
                    selectedDate={selectedDate}
                    onSelectDate={(date) => {
                        setSelectedDate(date)
                        setShowDatePicker(false)
                    }}
                    onClose={() => setShowDatePicker(false)}
                />
            )}

            {/* Notifications Panel */}
            {showNotifications && (
                <div
                    ref={(ref) => setNotificationRef(ref)}
                    className="absolute top-16 right-4 bg-white rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto z-50"
                >
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold">Notifications</h3>
                        <button onClick={() => setShowNotifications(false)}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                            <p className="text-sm">New task created: "Team Meeting"</p>
                            <p className="text-xs text-gray-500">2 minutes ago</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
                            <p className="text-sm">Task completed: "Submit Report"</p>
                            <p className="text-xs text-gray-500">1 hour ago</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-yellow-500">
                            <p className="text-sm">John accepted your task invitation</p>
                            <p className="text-xs text-gray-500">3 hours ago</p>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    )
}
