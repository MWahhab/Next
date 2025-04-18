"use client"

import { useState, useEffect, useRef } from "react"

export default function CountUp({ value, className = "", duration = 1000 }) {
    const [displayValue, setDisplayValue] = useState(0)
    const previousValueRef = useRef(0)
    const animationFrameRef = useRef(null)
    const startTimeRef = useRef(null)

    useEffect(() => {
        // Store the previous value
        const previousValue = previousValueRef.current

        // Cancel any ongoing animation
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
        }

        // Animation function
        const animate = (timestamp) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp
            }

            const elapsed = timestamp - startTimeRef.current
            const progress = Math.min(elapsed / duration, 1)

            // Easing function for a more natural animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)

            // Calculate the current value
            const currentValue = Math.floor(previousValue + easeOutQuart * (value - previousValue))
            setDisplayValue(currentValue)

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate)
            } else {
                // Ensure we end exactly at the target value
                setDisplayValue(value)
                previousValueRef.current = value
                startTimeRef.current = null
            }
        }

        // Start the animation
        animationFrameRef.current = requestAnimationFrame(animate)

        // Cleanup
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [value, duration])

    // Format the number with commas
    const formattedValue = displayValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    return <span className={className}>{formattedValue}</span>
}
