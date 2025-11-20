'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ScoreData } from '@/types/game'

interface ScoreDisplayProps {
  /** Current score data */
  scoreData: ScoreData
  /** Whether to show animated score changes */
  animated?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Score display component with current and high score
 * Features animated score changes and persistent storage indication
 */
export function ScoreDisplay({
  scoreData,
  animated = true,
  className
}: ScoreDisplayProps) {
  const { current, high, foodEaten, gameTime, gamesPlayed } = scoreData

  // Check if current score is a new high score
  const isNewHighScore = useMemo(
    () => current > 0 && current >= high,
    [current, high]
  )

  // Format game time for display
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(gameTime / 60)
    const seconds = gameTime % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [gameTime])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Current Score */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground font-medium mb-1">
          Current Score
        </div>
        <div
          className={cn(
            'text-3xl font-bold text-primary transition-all duration-300',
            {
              'scale-110 text-green-600 animate-pulse':
                isNewHighScore && animated,
              'animate-bounce': animated && current > 0
            }
          )}
          aria-live="polite"
          aria-label={`Current score: ${current} points`}>
          {current.toLocaleString()}
        </div>
        {isNewHighScore && (
          <div className="text-xs text-green-600 font-semibold animate-pulse mt-1">
            🎉 New High Score!
          </div>
        )}
      </div>

      {/* High Score */}
      <div className="text-center">
        <div className="text-sm text-muted-foreground font-medium mb-1">
          High Score
        </div>
        <div
          className="text-xl font-semibold text-foreground"
          aria-label={`High score: ${high} points`}>
          {high.toLocaleString()}
        </div>
      </div>

      {/* Game Statistics */}
      <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
        <div className="text-center">
          <div className="text-xs text-muted-foreground font-medium mb-1">
            Food Eaten
          </div>
          <div className="text-lg font-semibold text-orange-600">
            {foodEaten}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-muted-foreground font-medium mb-1">
            Time
          </div>
          <div className="text-lg font-semibold text-blue-600">
            {formattedTime}
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-muted-foreground font-medium mb-1">
            Games
          </div>
          <div className="text-lg font-semibold text-purple-600">
            {gamesPlayed}
          </div>
        </div>
      </div>

      {/* Score per food ratio */}
      <div className="text-center pt-2 border-t border-border">
        <div className="text-xs text-muted-foreground font-medium mb-1">
          Points per Food
        </div>
        <div className="text-sm font-medium text-foreground">
          {foodEaten > 0 ? Math.round(current / foodEaten) : 0} pts/food
        </div>
      </div>

      {/* Accessibility information */}
      <div className="sr-only">
        <p>
          Score information: Current score is {current} points, high score is{' '}
          {high} points
        </p>
        <p>
          Game statistics: {foodEaten} food eaten, {formattedTime} elapsed,{' '}
          {gamesPlayed} games played
        </p>
        {isNewHighScore && (
          <p>Congratulations! You have achieved a new high score!</p>
        )}
      </div>
    </div>
  )
}
