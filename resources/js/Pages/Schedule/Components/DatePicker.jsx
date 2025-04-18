"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

export default function DatePicker({ selectedDate, onSelectDate, onClose }) {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate))
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

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay()
    }

    const handlePrevMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(currentMonth.getMonth() - 1)
        setCurrentMonth(newMonth)
    }

    const handleNextMonth = () => {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(currentMonth.getMonth() + 1)
        setCurrentMonth(newMonth)
    }

    const handleSelectDate = (day) => {
        const newDate = new Date(currentMonth)
        newDate.setDate(day)
        onSelectDate(newDate)
    }

    const renderCalendar = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const daysInMonth = getDaysInMonth(year, month)
        const firstDayOfMonth = getFirstDayOfMonth(year, month)

        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-10"></div>)
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            const isSelected =
                selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year

            const isToday =
                new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year

            days.push(
                <div
                    key={day}
                    onClick={() => handleSelectDate(day)}
                    className={`h-10 flex items-center justify-center rounded-full cursor-pointer transition-colors
            ${isSelected ? "bg-blue-600 text-white" : "hover:bg-gray-100"}
            ${isToday && !isSelected ? "border border-blue-600 text-blue-600" : ""}
          `}
                >
                    {day}
                </div>,
            )
        }

        return days
    }

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold">Select Date</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="font-medium">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </div>
                        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map((day) => (
                            <div key={day} className="text-center text-sm text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                </div>
            </div>
        </div>
    )
}
