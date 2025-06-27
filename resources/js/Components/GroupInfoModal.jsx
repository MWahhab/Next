"use client"

import { useState } from "react"
import { X, Edit2, Users, User } from "lucide-react"
import { router } from "@inertiajs/react"

export default function GroupInfoModal({ isOpen, onClose, chat, participants, currentUserId }) {
    const [isEditing, setIsEditing] = useState(false)
    const [title, setTitle] = useState(chat?.title || "")
    const [description, setDescription] = useState(chat?.description || "")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errors, setErrors] = useState({})

    if (!isOpen || !chat) return null

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!title.trim()) {
            setErrors({ title: "Title is required" })
            return
        }

        setIsSubmitting(true)

        router.put(
            route("chat.update", chat.id),
            {
                title: title.trim(),
                description: description.trim() || null,
            },
            {
                onSuccess: () => {
                    setIsEditing(false)
                    setIsSubmitting(false)
                },
                onError: (errors) => {
                    setErrors(errors)
                    setIsSubmitting(false)
                },
            },
        )
    }

    const isAdmin = chat.admin_id === currentUserId

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">Group Information</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                    {isEditing ? (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Group Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-gray-400">(optional)</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setTitle(chat.title || "")
                                        setDescription(chat.description || "")
                                        setErrors({})
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="mb-6">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-lg font-medium text-gray-900">{chat.title}</h3>
                                    {isAdmin && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full"
                                            title="Edit group info"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    )}
                                </div>
                                {chat.description && <p className="mt-1 text-gray-600">{chat.description}</p>}
                                <p className="mt-2 text-sm text-gray-500">
                                    Created on {new Date(chat.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center mb-3">
                                    <Users size={18} className="text-gray-600 mr-2" />
                                    <h3 className="font-medium text-gray-800">Participants ({participants.length})</h3>
                                </div>

                                <div className="space-y-2">
                                    {participants.map((participant) => (
                                        <div key={participant.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                                <User size={16} className="text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {participant.name}
                                                    {participant.id === currentUserId && " (You)"}
                                                </p>
                                                {participant.id === chat.admin_id && <span className="text-xs text-blue-600">Admin</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
