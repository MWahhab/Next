"use client"

import { useState, useEffect, useRef } from "react"
import {
    X,
    Trash2,
    User,
    Check,
    XIcon,
    Clock,
    Calendar,
    Edit,
    MoreVertical,
    Save,
    Plus,
    UserPlus,
    ArrowLeft,
} from "lucide-react"

export default function TaskViewModal({ task, onClose, onBackToDayView }) {
    const [showPeopleDetails, setShowPeopleDetails] = useState(false)
    const [comment, setComment] = useState("")
    const [editMode, setEditMode] = useState({
        title: false,
        description: false,
        importance: false,
        date: false,
        time: false,
    })
    const [editedTask, setEditedTask] = useState({ ...task })
    const [editingComment, setEditingComment] = useState(null)
    const [showAddPeople, setShowAddPeople] = useState(false)
    const [newPersonName, setNewPersonName] = useState("")
    const modalRef = useRef(null)

    // User privileges (in a real app, this would come from auth)
    const userPrivileges = {
        canEdit: true,
        userId: "current-user", // Simulating current user ID
    }

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

    const getStatusIcon = (status) => {
        switch (status) {
            case "accepted":
                return <Check size={16} className="text-green-500" />
            case "declined":
                return <XIcon size={16} className="text-red-500" />
            case "pending":
                return <Clock size={16} className="text-yellow-500" />
            default:
                return null
        }
    }

    const formatDate = (date) => {
        if (!date) return ""
        if (typeof date === "string") return date

        return date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    const handleSubmitComment = (e) => {
        e.preventDefault()
        if (comment.trim()) {
            // Here you would handle adding the comment
            console.log("New comment:", comment)
            setComment("")
        }
    }

    const handleSaveEdit = (field) => {
        // Here you would save the changes to the server
        console.log(`Saving changes to ${field}:`, editedTask[field])
        setEditMode({ ...editMode, [field]: false })
    }

    const handleEditComment = (commentId, newText) => {
        // Here you would update the comment on the server
        console.log(`Editing comment ${commentId}:`, newText)
        setEditingComment(null)
    }

    const handleDeleteComment = (commentId) => {
        // Here you would delete the comment on the server
        console.log(`Deleting comment ${commentId}`)
    }

    const handleAddPerson = () => {
        if (newPersonName.trim()) {
            // Here you would add the person to the task on the server
            console.log(`Adding person to task: ${newPersonName}`)

            // For demo purposes, we'll update the local state
            const newPerson = {
                id: Math.floor(Math.random() * 1000),
                name: newPersonName,
                status: "pending",
            }

            setEditedTask({
                ...editedTask,
                people: [...(editedTask.people || []), newPerson],
            })

            setNewPersonName("")
            setShowAddPeople(false)
        }
    }

    const isCommentOwner = (commentUserId) => {
        // In a real app, you would compare with the actual user ID
        return commentUserId === userPrivileges.userId
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center">
                        <button
                            onClick={onBackToDayView}
                            className="mr-3 p-1 rounded-full hover:bg-gray-200 transition-colors"
                            title="Back to day view"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-xl font-semibold">Task Details</h2>
                    </div>
                    <div className="flex items-center">
                        {userPrivileges.canEdit && (
                            <button className="p-2 text-red-500 hover:bg-red-50 rounded-full mr-2" title="Delete Task">
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <div className="text-sm text-gray-500">Title</div>
                                {userPrivileges.canEdit && !editMode.title && (
                                    <button
                                        onClick={() => setEditMode({ ...editMode, title: true })}
                                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                                    >
                                        <Edit size={14} />
                                    </button>
                                )}
                            </div>

                            {editMode.title ? (
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        value={editedTask.title}
                                        onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={() => handleSaveEdit("title")}
                                        className="ml-2 p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        <Save size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="text-lg font-medium">{task.title}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <div className="text-sm text-gray-500">Importance</div>
                                {userPrivileges.canEdit && !editMode.importance && (
                                    <button
                                        onClick={() => setEditMode({ ...editMode, importance: true })}
                                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                                    >
                                        <Edit size={14} />
                                    </button>
                                )}
                            </div>

                            {editMode.importance ? (
                                <div className="flex items-center">
                                    <select
                                        value={editedTask.importance}
                                        onChange={(e) => setEditedTask({ ...editedTask, importance: Number.parseInt(e.target.value) })}
                                        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={1}>High</option>
                                        <option value={2}>Medium</option>
                                        <option value={3}>Low</option>
                                    </select>
                                    <button
                                        onClick={() => handleSaveEdit("importance")}
                                        className="ml-2 p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        <Save size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <div className={`w-4 h-4 rounded-full ${getImportanceColor(task.importance)}`}></div>
                                    <span className="ml-2">{getImportanceLabel(task.importance)}</span>
                                </div>
                            )}
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <div className="text-sm text-gray-500">Description</div>
                                {userPrivileges.canEdit && !editMode.description && (
                                    <button
                                        onClick={() => setEditMode({ ...editMode, description: true })}
                                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                                    >
                                        <Edit size={14} />
                                    </button>
                                )}
                            </div>

                            {editMode.description ? (
                                <div className="flex flex-col">
                  <textarea
                      value={editedTask.description}
                      onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                      rows={4}
                      className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                                    <button
                                        onClick={() => handleSaveEdit("description")}
                                        className="mt-2 self-end px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-gray-50 p-3 rounded-lg text-gray-700 border border-gray-200">{task.description}</div>
                            )}
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <div className="text-sm text-gray-500">Date & Time</div>
                                {userPrivileges.canEdit && !editMode.date && !editMode.time && (
                                    <button
                                        onClick={() => setEditMode({ ...editMode, date: true, time: true })}
                                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                                    >
                                        <Edit size={14} />
                                    </button>
                                )}
                            </div>

                            {editMode.date && editMode.time ? (
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center">
                                        <Calendar size={18} className="text-gray-400 mr-2" />
                                        <input
                                            type="date"
                                            value={editedTask.dateStr || formatDate(editedTask.date).split("/").reverse().join("-")}
                                            onChange={(e) => setEditedTask({ ...editedTask, dateStr: e.target.value })}
                                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <Clock size={18} className="text-gray-400 mr-2" />
                                        <input
                                            type="time"
                                            value={editedTask.time}
                                            onChange={(e) => setEditedTask({ ...editedTask, time: e.target.value })}
                                            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleSaveEdit("date")
                                            handleSaveEdit("time")
                                        }}
                                        className="self-end px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                                    <Calendar size={18} className="text-gray-400 mr-2" />
                                    <span>{formatDate(task.date)}</span>
                                    {task.time && (
                                        <>
                                            <span className="mx-2">•</span>
                                            <Clock size={18} className="text-gray-400 mr-2" />
                                            <span>{task.time}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <div className="text-sm text-gray-500">People</div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setShowPeopleDetails(!showPeopleDetails)}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                        {showPeopleDetails ? "Hide Details" : "Show Details"}
                                    </button>
                                    {userPrivileges.canEdit && (
                                        <button
                                            onClick={() => setShowAddPeople(!showAddPeople)}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                                            title="Add People"
                                        >
                                            <UserPlus size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                {showAddPeople && (
                                    <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="flex items-center">
                                            <input
                                                type="text"
                                                value={newPersonName}
                                                onChange={(e) => setNewPersonName(e.target.value)}
                                                placeholder="Enter name..."
                                                className="flex-1 p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                onClick={handleAddPerson}
                                                disabled={!newPersonName.trim()}
                                                className="ml-2 p-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-1">Person will be invited to this task</p>
                                    </div>
                                )}

                                {task.people && task.people.length > 0 ? (
                                    task.people.map((person) => (
                                        <div
                                            key={person.id}
                                            className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0"
                                        >
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                    <User size={16} className="text-gray-600" />
                                                </div>
                                                <span className="ml-2">{person.name}</span>
                                            </div>

                                            {showPeopleDetails && (
                                                <div className="flex items-center">
                                                    {getStatusIcon(person.status)}
                                                    <span className="ml-1 text-sm capitalize">{person.status}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-2 text-gray-500 text-center">No people assigned</div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-gray-500 mb-1">Comments</div>
                            <div className="bg-gray-50 p-3 rounded-lg mb-3 max-h-40 overflow-y-auto border border-gray-200">
                                {task.comments && task.comments.length > 0 ? (
                                    task.comments.map((comment) => (
                                        <div key={comment.id} className="mb-3 last:mb-0">
                                            {editingComment === comment.id ? (
                                                <div className="flex flex-col">
                          <textarea
                              value={comment.text}
                              onChange={(e) => {
                                  const updatedComments = task.comments.map((c) =>
                                      c.id === comment.id ? { ...c, text: e.target.value } : c,
                                  )
                                  setEditedTask({ ...editedTask, comments: updatedComments })
                              }}
                              rows={2}
                              className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          ></textarea>
                                                    <div className="flex justify-end mt-1 space-x-2">
                                                        <button
                                                            onClick={() => setEditingComment(null)}
                                                            className="px-2 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditComment(comment.id, comment.text)}
                                                            className="px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="font-medium">{comment.user}</span>
                                                        <div className="flex items-center">
                                                            <span className="text-xs text-gray-500 mr-2">{comment.time}</span>
                                                            {isCommentOwner(comment.user) && (
                                                                <div className="relative group">
                                                                    <button className="p-1 rounded-full hover:bg-gray-200">
                                                                        <MoreVertical size={14} />
                                                                    </button>
                                                                    <div className="absolute right-0 mt-1 w-24 bg-white shadow-lg rounded-md overflow-hidden z-10 hidden group-hover:block">
                                                                        <button
                                                                            onClick={() => setEditingComment(comment.id)}
                                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteComment(comment.id)}
                                                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{comment.text}</p>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-2 text-gray-500 text-center">No comments yet</div>
                                )}
                            </div>

                            <form onSubmit={handleSubmitComment}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="w-full p-2 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!comment.trim()}
                                        className="absolute right-2 top-2 text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
