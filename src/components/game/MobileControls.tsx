'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Direction } from '@/types/game'

interface MobileControlsProps {
  /** Handler for direction changes */
  onDirectionChange: (direction: Direction) => void
  /** Whether the controls are disabled */
  disabled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Touch-based directional controls for mobile devices
 * Features virtual D-pad, swipe gestures, and proper touch target sizes
 */
export function MobileControls({
  onDirectionChange,
  disabled = false,
  className
}: MobileControlsProps) {
  const [activeDirection, setActiveDirection] = useState<Direction | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const swipeThreshold = 50 // Minimum distance for swipe detection

  // Handle button press with visual feedback
  const handleDirectionPress = useCallback(
    (direction: Direction) => {
      if (disabled) return
      setActiveDirection(direction)
      onDirectionChange(direction)

      // Clear active state after a short delay
      setTimeout(() => setActiveDirection(null), 150)
    },
    [disabled, onDirectionChange]
  )

  // Handle touch start for swipe detection
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (disabled || e.touches.length !== 1) return

      // Prevent default browser scrolling behavior
      e.preventDefault()

      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    },
    [disabled]
  )

  // Handle touch end for swipe direction detection
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (disabled || !touchStartRef.current || e.changedTouches.length !== 1)
        return

      // Prevent default browser scrolling behavior
      e.preventDefault()

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      // Calculate if swipe is significant enough
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (Math.max(absX, absY) < swipeThreshold) {
        touchStartRef.current = null
        return
      }

      // Determine swipe direction
      let swipeDirection: Direction | null = null
      if (absX > absY) {
        // Horizontal swipe
        swipeDirection = deltaX > 0 ? Direction.RIGHT : Direction.LEFT
      } else {
        // Vertical swipe
        swipeDirection = deltaY > 0 ? Direction.DOWN : Direction.UP
      }

      if (swipeDirection) {
        handleDirectionPress(swipeDirection)
      }

      touchStartRef.current = null
    },
    [disabled, handleDirectionPress, swipeThreshold]
  )

  // Add global touch event listeners for swipe detection
  useEffect(() => {
    if (typeof window === 'undefined') return

    document.addEventListener('touchstart', handleTouchStart, {
      passive: false
    })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchEnd])

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 p-4 select-none',
        'lg:hidden', // Hide on large screens
        className
      )}
      aria-label="Mobile game controls">
      {/* Instructions */}
      <div className="text-xs text-muted-foreground text-center mb-2">
        Tap buttons or swipe to move
      </div>

      {/* D-Pad Layout */}
      <div className="relative grid grid-cols-3 grid-rows-3 gap-1 w-32 h-32">
        {/* Up Button */}
        <button
          className={cn(
            'col-start-2 row-start-1 w-10 h-10 rounded-lg border-2 border-border',
            'flex items-center justify-center transition-all duration-150',
            'touch-manipulation', // Optimize for touch
            'active:scale-95', // Visual feedback on press
            disabled
              ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
              : 'bg-background hover:bg-accent text-foreground active:bg-primary active:text-primary-foreground',
            activeDirection === Direction.UP &&
              'bg-primary text-primary-foreground scale-95'
          )}
          onTouchStart={(e) => {
            e.preventDefault()
            handleDirectionPress(Direction.UP)
          }}
          onClick={() => handleDirectionPress(Direction.UP)}
          disabled={disabled}
          aria-label="Move up"
          style={{ minHeight: '44px', minWidth: '44px' }} // Ensure minimum touch target size
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* Left Button */}
        <button
          className={cn(
            'col-start-1 row-start-2 w-10 h-10 rounded-lg border-2 border-border',
            'flex items-center justify-center transition-all duration-150',
            'touch-manipulation active:scale-95',
            disabled
              ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
              : 'bg-background hover:bg-accent text-foreground active:bg-primary active:text-primary-foreground',
            activeDirection === Direction.LEFT &&
              'bg-primary text-primary-foreground scale-95'
          )}
          onTouchStart={(e) => {
            e.preventDefault()
            handleDirectionPress(Direction.LEFT)
          }}
          onClick={() => handleDirectionPress(Direction.LEFT)}
          disabled={disabled}
          aria-label="Move left"
          style={{ minHeight: '44px', minWidth: '44px' }}>
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Center (Decorative) */}
        <div className="col-start-2 row-start-2 w-10 h-10 rounded-full bg-muted border-2 border-border flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
        </div>

        {/* Right Button */}
        <button
          className={cn(
            'col-start-3 row-start-2 w-10 h-10 rounded-lg border-2 border-border',
            'flex items-center justify-center transition-all duration-150',
            'touch-manipulation active:scale-95',
            disabled
              ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
              : 'bg-background hover:bg-accent text-foreground active:bg-primary active:text-primary-foreground',
            activeDirection === Direction.RIGHT &&
              'bg-primary text-primary-foreground scale-95'
          )}
          onTouchStart={(e) => {
            e.preventDefault()
            handleDirectionPress(Direction.RIGHT)
          }}
          onClick={() => handleDirectionPress(Direction.RIGHT)}
          disabled={disabled}
          aria-label="Move right"
          style={{ minHeight: '44px', minWidth: '44px' }}>
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Down Button */}
        <button
          className={cn(
            'col-start-2 row-start-3 w-10 h-10 rounded-lg border-2 border-border',
            'flex items-center justify-center transition-all duration-150',
            'touch-manipulation active:scale-95',
            disabled
              ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
              : 'bg-background hover:bg-accent text-foreground active:bg-primary active:text-primary-foreground',
            activeDirection === Direction.DOWN &&
              'bg-primary text-primary-foreground scale-95'
          )}
          onTouchStart={(e) => {
            e.preventDefault()
            handleDirectionPress(Direction.DOWN)
          }}
          onClick={() => handleDirectionPress(Direction.DOWN)}
          disabled={disabled}
          aria-label="Move down"
          style={{ minHeight: '44px', minWidth: '44px' }}>
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* Accessibility instructions */}
      <div className="sr-only" aria-live="polite">
        Mobile controls active. Use directional buttons or swipe gestures to
        control snake movement.
        {disabled && ' Controls are currently disabled.'}
      </div>
    </div>
  )
}
