"use client"

import { useState, useEffect } from "react"
import { Head } from "@inertiajs/react"
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout"
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, Filter, Grid, List, Search } from "lucide-react"
import DayWidget from "@/Pages/Schedule/Components/DayWidget"
import TaskModal from "@/Pages/Schedule/Components/TaskModal"
import TaskViewModal from "@/Pages/Schedule/Components/TaskViewModal"
import DayTasksModal from "@/Pages/Schedule/Components/DayTasksModal"
import DatePicker from "@/Pages/Schedule/Components/DatePicker"
import RepeatTasksModal from "@/Pages/Schedule/Components/RepeatTasksModal"

export default function Schedule({ auth }) {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [showTaskModal, setShowTaskModal] = useState(false)
    const [showTaskViewModal, setShowTaskViewModal] = useState(false)
    const [showDayTasksModal, setShowDayTasksModal] = useState(false)
    const [showDatePicker, setShowDatePicker] = useState(false)
    const [showRepeatTasksModal, setShowRepeatTasksModal] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [selectedDay, setSelectedDay] = useState(null)
    const [days, setDays] = useState([])
    const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'
    const [searchTerm, setSearchTerm] = useState("")
    const [filterImportance, setFilterImportance] = useState("all") // 'all', 'high', 'medium', 'low'
    const [showFilters, setShowFilters] = useState(false)

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

    // Filter days based on search term and importance
    const filteredDays = days
        .map((day) => {
            // Filter standalone tasks
            const filteredStandaloneTasks = day.standaloneTasks.filter((task) => {
                const matchesSearch =
                    searchTerm === "" ||
                    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    task.description.toLowerCase().includes(searchTerm.toLowerCase())

                const matchesImportance =
                    filterImportance === "all" ||
                    (filterImportance === "high" && task.importance === 1) ||
                    (filterImportance === "medium" && task.importance === 2) ||
                    (filterImportance === "low" && task.importance === 3)

                return matchesSearch && matchesImportance
            })

            // Filter routine tasks
            const filteredRoutineTasks = day.routineTasks.filter((task) => {
                const matchesSearch =
                    searchTerm === "" ||
                    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    task.description.toLowerCase().includes(searchTerm.toLowerCase())

                const matchesImportance =
                    filterImportance === "all" ||
                    (filterImportance === "high" && task.importance === 1) ||
                    (filterImportance === "medium" && task.importance === 2) ||
                    (filterImportance === "low" && task.importance === 3)

                return matchesSearch && matchesImportance
            })

            return {
                ...day,
                standaloneTasks: filteredStandaloneTasks,
                routineTasks: filteredRoutineTasks,
                filtered: filteredStandaloneTasks.length > 0 || filteredRoutineTasks.length > 0,
            }
        })
        .filter((day) => day.filtered)

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title="Schedule" />

            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                {/* Top Bar with Date Navigation and Actions */}
                <div className="bg-white rounded-lg shadow-sm mb-6 flex flex-col sm:flex-row">
                    <div className="flex items-center justify-between p-4 border-b sm:border-b-0 sm:border-r border-gray-200 sm:w-auto">
                        <div className="flex items-center">
                            <button onClick={handlePrevDay} className="p-2 rounded-full hover:bg-gray-200">
                                <ChevronLeft size={20} />
                            </button>
                            <div
                                className="mx-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer flex items-center hover:bg-gray-100 transition-colors"
                                onClick={() => setShowDatePicker(true)}
                            >
                                <Calendar size={18} className="mr-2 text-gray-600" />
                                <span className="font-medium">{formatDate(selectedDate)}</span>
                                <span className="ml-2 text-gray-600 hidden sm:inline">{getDayName(selectedDate)}</span>
                            </div>
                            <button onClick={handleNextDay} className="p-2 rounded-full hover:bg-gray-200">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 p-4 flex items-center">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                    </div>

                    <div className="flex items-center p-4 border-t sm:border-t-0 sm:border-l border-gray-200">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowTaskModal(true)}
                                className="p-2 bg-gray-900 text-white rounded-full shadow-sm hover:bg-gray-800 transition-colors"
                                title="Add Task"
                            >
                                <Plus size={20} />
                            </button>

                            <button
                                onClick={() => setShowRepeatTasksModal(true)}
                                className="p-2 bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 transition-colors"
                                title="Repeating Tasks"
                            >
                                <Clock size={20} />
                            </button>

                            <div className="bg-gray-100 rounded-lg p-1 flex">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                    title="Grid View"
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                    title="List View"
                                >
                                    <List size={18} />
                                </button>
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-2 rounded-md ${showFilters ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                    title="Filter Tasks"
                                >
                                    <Filter size={18} />
                                </button>

                                {showFilters && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                        <div className="p-3">
                                            <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Importance</h3>
                                            <div className="space-y-2">
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="importance"
                                                        checked={filterImportance === "all"}
                                                        onChange={() => setFilterImportance("all")}
                                                        className="mr-2"
                                                    />
                                                    <span className="text-sm">All</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="importance"
                                                        checked={filterImportance === "high"}
                                                        onChange={() => setFilterImportance("high")}
                                                        className="mr-2"
                                                    />
                                                    <div className="flex items-center">
                                                        <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                                                        <span className="text-sm">High</span>
                                                    </div>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="importance"
                                                        checked={filterImportance === "medium"}
                                                        onChange={() => setFilterImportance("medium")}
                                                        className="mr-2"
                                                    />
                                                    <div className="flex items-center">
                                                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                                                        <span className="text-sm">Medium</span>
                                                    </div>
                                                </label>
                                                <label className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="importance"
                                                        checked={filterImportance === "low"}
                                                        onChange={() => setFilterImportance("low")}
                                                        className="mr-2"
                                                    />
                                                    <div className="flex items-center">
                                                        <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                                                        <span className="text-sm">Low</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Days Grid/List */}
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-3 auto-rows-fr">
                        {filteredDays.map((day) => (
                            <DayWidget key={day.id} day={day} onClick={() => handleDayClick(day)} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredDays.map((day) => (
                            <div key={day.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{formatDate(day.date)}</div>
                                        <div className="text-sm text-gray-600">{getDayName(day.date)}</div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">
                                        {day.standaloneTasks.filter((t) => !t.completed).length +
                                            day.routineTasks.filter((t) => !t.completed).length}{" "}
                                        Uncompleted
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {day.standaloneTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                                            onClick={() => handleTaskClick(task, day.date)}
                                        >
                                            <div className="flex items-center">
                                                <div
                                                    className={`w-3 h-3 rounded-full ${
                                                        task.importance === 1
                                                            ? "bg-red-500"
                                                            : task.importance === 2
                                                                ? "bg-yellow-500"
                                                                : "bg-green-500"
                                                    } mr-3`}
                                                ></div>
                                                <div>
                                                    <div className="font-medium">{task.title}</div>
                                                    <div className="text-xs text-gray-500">{task.time}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {task.completed ? <span className="text-green-600">Completed</span> : <span>Standalone</span>}
                                            </div>
                                        </div>
                                    ))}
                                    {day.routineTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                                            onClick={() => handleTaskClick(task, day.date)}
                                        >
                                            <div className="flex items-center">
                                                <div
                                                    className={`w-3 h-3 rounded-full ${
                                                        task.importance === 1
                                                            ? "bg-red-500"
                                                            : task.importance === 2
                                                                ? "bg-yellow-500"
                                                                : "bg-green-500"
                                                    } mr-3`}
                                                ></div>
                                                <div>
                                                    <div className="font-medium">{task.title}</div>
                                                    <div className="text-xs text-gray-500">{task.time}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {task.completed ? <span className="text-green-600">Completed</span> : <span>Routine</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {filteredDays.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No tasks found</h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm || filterImportance !== "all"
                                ? "Try adjusting your search or filters"
                                : "Start by adding a new task"}
                        </p>
                        <button
                            onClick={() => setShowTaskModal(true)}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 inline-flex items-center"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                )}
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

            {/* Repeating Tasks Modal */}
            {showRepeatTasksModal && <RepeatTasksModal onClose={() => setShowRepeatTasksModal(false)} />}
        </AuthenticatedLayout>
    )
}
