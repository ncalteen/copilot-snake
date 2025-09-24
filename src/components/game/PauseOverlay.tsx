'use client'

import { Play, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PauseOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean
  /** Whether pause was triggered automatically (tab switch) */
  isAutoPause?: boolean
  /** Handler for resuming the game */
  onResume: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Pause Overlay Component
 * Shows when the game is paused with resume controls and visual feedback
 */
export function PauseOverlay({
  visible,
  isAutoPause = false,
  onResume,
  className
}: PauseOverlayProps) {
  if (!visible) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute inset-0 z-20',
        'bg-black/50 backdrop-blur-sm',
        'flex items-center justify-center',
        'animate-in fade-in duration-300',
        className
      )}>
      <div className="bg-background border border-border rounded-lg p-8 shadow-lg max-w-sm w-full mx-4">
        <div className="text-center space-y-6">
          {/* Pause Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Coffee className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Pause Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Game Paused</h2>
            <p className="text-muted-foreground">
              {isAutoPause
                ? 'Game paused automatically when you switched tabs'
                : 'Take a break and resume when ready'}
            </p>
          </div>

          {/* Resume Button */}
          <Button onClick={onResume} size="lg" className="w-full" autoFocus>
            <Play className="w-4 h-4 mr-2" />
            Resume Game
          </Button>

          {/* Controls Hint */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Press Space or P to resume</p>
            {isAutoPause && (
              <p className="text-orange-600 dark:text-orange-400">
                💡 Game auto-pauses when you switch tabs
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" aria-live="polite">
        Game is paused.{' '}
        {isAutoPause
          ? 'Paused automatically due to tab switch.'
          : 'Paused by user.'}{' '}
        Press resume button or Space key to continue.
      </div>
    </div>
  )
}
