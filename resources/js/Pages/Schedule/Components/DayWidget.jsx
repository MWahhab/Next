"use client"

import { useState, useEffect } from "react"

export default function DayWidget({ day, onClick }) {
    const [isAnimating, setIsAnimating] = useState(false)
    const [hasUrgentTasks, setHasUrgentTasks] = useState(false)
    const [hasPendingInvites, setHasPendingInvites] = useState(false)
    const [isToday, setIsToday] = useState(false)
    const [timeLeft, setTimeLeft] = useState(null)
    const [nextDueTask, setNextDueTask] = useState(null)

    useEffect(() => {
        // Check if this day is today
        const today = new Date()
        const isTodayDate =
            day.date.getDate() === today.getDate() &&
            day.date.getMonth() === today.getMonth() &&
            day.date.getFullYear() === today.getFullYear()

        setIsToday(isTodayDate)

        // Check for high importance tasks that are not completed
        const hasHighImportance = [...day.standaloneTasks, ...day.routineTasks].some(
            (task) => task.importance === 1 && !task.completed,
        )
        setHasUrgentTasks(hasHighImportance)

        // Simulate checking for pending invites (in a real app, this would come from the data)
        setHasPendingInvites(Math.random() > 0.7)

        // Start animation if there are urgent tasks or pending invites
        if (hasHighImportance || Math.random() > 0.7) {
            setIsAnimating(true)
            const interval = setInterval(() => {
                setIsAnimating((prev) => !prev)
            }, 2000)

            return () => clearInterval(interval)
        }

        // Find the next due task for today
        if (isTodayDate) {
            const allTasks = [...day.standaloneTasks, ...day.routineTasks]
            const uncompletedTasks = allTasks.filter((task) => !task.completed && task.dueTime)

            if (uncompletedTasks.length > 0) {
                // Sort by due time
                uncompletedTasks.sort((a, b) => a.dueTime - b.dueTime)
                setNextDueTask(uncompletedTasks[0])
            }
        }
    }, [day])

    // Update time left for the next due task
    useEffect(() => {
        if (!nextDueTask || !isToday) return

        const updateTimeLeft = () => {
            const now = new Date()
            const dueTime = nextDueTask.dueTime

            if (!dueTime) return

            const diffMs = dueTime - now

            if (diffMs <= 0) {
                setTimeLeft("Overdue")
                return
            }

            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
            const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000)

            if (diffHrs > 0) {
                setTimeLeft(`${diffHrs}h ${diffMins}m left`)
            } else if (diffMins > 0) {
                setTimeLeft(`${diffMins}m ${diffSecs}s left`)
            } else {
                setTimeLeft(`${diffSecs}s left`)
            }
        }

        updateTimeLeft()
        const interval = setInterval(updateTimeLeft, 1000)

        return () => clearInterval(interval)
    }, [nextDueTask, isToday])

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

    // Count tasks by importance
    const countTasksByImportance = (tasks) => {
        const counts = { 1: 0, 2: 0, 3: 0 }
        tasks.forEach((task) => {
            counts[task.importance]++
        })
        return counts
    }

    // Count uncompleted tasks
    const countUncompletedTasks = (tasks) => {
        return tasks.filter((task) => !task.completed).length
    }

    const standaloneImportanceCounts = countTasksByImportance(day.standaloneTasks)
    const routineImportanceCounts = countTasksByImportance(day.routineTasks)

    const totalUncompletedTasks = countUncompletedTasks(day.standaloneTasks) + countUncompletedTasks(day.routineTasks)

    // Determine widget border style based on state
    const getBorderStyle = () => {
        if (hasUrgentTasks) return "border-red-500 border-2"
        if (hasPendingInvites) return "border-blue-500 border-2"
        if (isToday) return "border-green-500 border-2"
        return "border-gray-200"
    }

    return (
        <div
            className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all ${getBorderStyle()} ${
                isAnimating ? "translate-y-[-2px]" : ""
            }`}
            onClick={onClick}
        >
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                    <div className="font-medium text-base">{formatDate(day.date)}</div>
                    <div className="text-sm text-gray-600">{getDayName(day.date)}</div>
                </div>
                {totalUncompletedTasks > 0 && (
                    <div className="text-sm font-medium text-gray-700">{totalUncompletedTasks} Uncompleted</div>
                )}
            </div>

            <div className="p-4">
                <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium">
                        1
                    </div>
                    <div className="ml-3 flex-1">
                        <div className="text-sm font-medium">Standalone Task(s)</div>
                        <div className="flex items-center mt-2 space-x-4">
                            {standaloneImportanceCounts[1] > 0 && (
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="ml-1 text-xs">{standaloneImportanceCounts[1]}</span>
                                </div>
                            )}
                            {standaloneImportanceCounts[2] > 0 && (
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span className="ml-1 text-xs">{standaloneImportanceCounts[2]}</span>
                                </div>
                            )}
                            {standaloneImportanceCounts[3] > 0 && (
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="ml-1 text-xs">{standaloneImportanceCounts[3]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium">
                        4
                    </div>
                    <div className="ml-3 flex-1">
                        <div className="text-sm font-medium">Routine Task(s)</div>
                        <div className="flex items-center mt-2 space-x-4">
                            {routineImportanceCounts[1] > 0 && (
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="ml-1 text-xs">{routineImportanceCounts[1]}</span>
                                </div>
                            )}
                            {routineImportanceCounts[2] > 0 && (
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span className="ml-1 text-xs">{routineImportanceCounts[2]}</span>
                                </div>
                            )}
                            {routineImportanceCounts[3] > 0 && (
                                <div className="flex items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="ml-1 text-xs">{routineImportanceCounts[3]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Countdown timer for next due task */}
            {isToday && timeLeft && (
                <div className="bg-yellow-100 text-yellow-800 text-xs font-medium py-2 px-3 text-center">
                    Next task due: {timeLeft}
                </div>
            )}

            {/* Pending invites indicator */}
            {hasPendingInvites && (
                <div className="bg-blue-100 text-blue-800 text-xs font-medium py-2 px-3 text-center">Pending invites</div>
            )}
        </div>
    )
}
