import React from 'react'
import { useSwipeable } from 'react-swipeable'

interface SwipeContainerProps {
    children: React.ReactNode
    onSwipeLeft?: () => void
    onSwipeRight?: () => void
}

export const SwipeContainer: React.FC<SwipeContainerProps> = ({
    children,
    onSwipeLeft,
    onSwipeRight
}) => {
    const handlers = useSwipeable({
        onSwipedLeft: onSwipeLeft,
        onSwipedRight: onSwipeRight,
        trackMouse: true
    })

    return (
        <div {...handlers} className="swipe-container">
            {children}
        </div>
    )
}
