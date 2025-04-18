"use client"

import { useRef, useEffect } from "react"
import { X, AlertTriangle } from "lucide-react"

export default function ConfirmationModal({
                                              isOpen,
                                              onClose,
                                              onConfirm,
                                              title,
                                              message,
                                              confirmText = "Confirm",
                                              cancelText = "Cancel",
                                              type = "danger", // danger, warning, info
                                              isProcessing = false,
                                          }) {
    const modalRef = useRef(null)

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target) && isOpen) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside)
            // Prevent scrolling when modal is open
            document.body.style.overflow = "hidden"
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.body.style.overflow = "auto"
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const getTypeStyles = () => {
        switch (type) {
            case "danger":
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
                    confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
                    header: "border-red-200 bg-red-50",
                }
            case "warning":
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
                    confirmButton: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
                    header: "border-yellow-200 bg-yellow-50",
                }
            case "info":
            default:
                return {
                    icon: <AlertTriangle className="h-6 w-6 text-blue-500" />,
                    confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
                    header: "border-blue-200 bg-blue-50",
                }
        }
    }

    const styles = getTypeStyles()

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className={`flex justify-between items-center p-4 border-b ${styles.header}`}>
                    <div className="flex items-center">
                        {styles.icon}
                        <h3 className="ml-2 text-lg font-medium text-gray-900">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        disabled={isProcessing}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-gray-700">{message}</p>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            disabled={isProcessing}
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.confirmButton} ${
                                isProcessing ? "opacity-75 cursor-not-allowed" : ""
                            }`}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Processing..." : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
