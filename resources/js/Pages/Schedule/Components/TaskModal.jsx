"use client"

import { useState, useEffect, useRef } from "react"
import { X, Plus, Calendar, Clock } from "lucide-react"

export default function TaskModal({ onClose }) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [importance, setImportance] = useState("medium")
    const [date, setDate] = useState("")
    const [time, setTime] = useState("")
    const [people, setPeople] = useState([])
    const [personInput, setPersonInput] = useState("")
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

    const handleAddPerson = () => {
        if (personInput.trim()) {
            setPeople([...people, personInput.trim()])
            setPersonInput("")
        }
    }

    const handleRemovePerson = (index) => {
        const newPeople = [...people]
        newPeople.splice(index, 1)
        setPeople(newPeople)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Here you would handle the form submission, e.g., send data to server
        console.log({
            title,
            description,
            importance,
            date,
            time,
            people,
        })

        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-semibold">New Task</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Importance</label>
                            <select
                                value={importance}
                                onChange={(e) => setImportance(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">With</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={personInput}
                                    onChange={(e) => setPersonInput(e.target.value)}
                                    placeholder="Add person..."
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddPerson}
                                    className="absolute right-2 top-2 text-blue-500 hover:text-blue-700"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {people.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {people.map((person, index) => (
                                        <div key={index} className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center">
                                            <span>{person}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePerson(index)}
                                                className="ml-1 text-gray-500 hover:text-gray-700"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Will send DMs to each person</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                                />
                                <Calendar className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                            <div className="relative">
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
                                />
                                <Clock className="absolute left-3 top-2.5 text-gray-400" size={20} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
