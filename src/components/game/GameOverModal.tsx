'use client'

import { Trophy, RotateCcw, Home, Clock, Target } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ScoreData } from '@/types/game'

interface GameOverModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Handler for modal open/close state */
  onOpenChange: (open: boolean) => void
  /** Final game score data */
  scoreData: ScoreData
  /** Handler for restarting the game */
  onRestartGame: () => void
  /** Handler for returning to menu/start screen */
  onReturnToMenu?: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Game over modal component with final score and game statistics
 * Features restart and menu navigation options with proper focus management
 */
export function GameOverModal({
  open,
  onOpenChange,
  scoreData,
  onRestartGame,
  onReturnToMenu,
  className
}: GameOverModalProps) {
  const { current, high, foodEaten, gameTime, gamesPlayed } = scoreData

  // Check if this was a new high score
  const isNewHighScore = current > 0 && current >= high && current > 0

  // Format game time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Calculate performance metrics
  const pointsPerFood = foodEaten > 0 ? Math.round(current / foodEaten) : 0
  const pointsPerSecond = gameTime > 0 ? Math.round(current / gameTime) : 0

  const handleRestartGame = () => {
    onOpenChange(false)
    onRestartGame()
  }

  const handleReturnToMenu = () => {
    onOpenChange(false)
    onReturnToMenu?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-md', className)}>
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            {isNewHighScore ? (
              <>
                <Trophy className="w-6 h-6 text-yellow-500" />
                New High Score!
              </>
            ) : (
              'Game Over'
            )}
          </DialogTitle>
          <DialogDescription className="text-base">
            {isNewHighScore
              ? 'Congratulations! You achieved a new personal best!'
              : 'Better luck next time! Keep practicing to improve your score.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Final Score Display */}
          <div className="text-center">
            <div className="text-sm text-muted-foreground font-medium mb-2">
              Final Score
            </div>
            <div
              className={cn(
                'text-4xl font-bold',
                isNewHighScore
                  ? 'text-yellow-500 animate-pulse'
                  : 'text-primary'
              )}>
              {current.toLocaleString()}
            </div>
            {!isNewHighScore && high > 0 && (
              <div className="text-sm text-muted-foreground mt-1">
                High Score: {high.toLocaleString()}
              </div>
            )}
          </div>

          {/* Game Statistics */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium">Food Eaten</span>
              </div>
              <div className="text-2xl font-bold">{foodEaten}</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Time</span>
              </div>
              <div className="text-2xl font-bold">{formatTime(gameTime)}</div>
            </div>
          </div>

          {/* Performance Metrics */}
          {(pointsPerFood > 0 || pointsPerSecond > 0) && (
            <div className="grid grid-cols-2 gap-4 text-center text-sm">
              {pointsPerFood > 0 && (
                <div>
                  <div className="text-muted-foreground font-medium">
                    Points/Food
                  </div>
                  <div className="font-semibold text-green-600">
                    {pointsPerFood}
                  </div>
                </div>
              )}
              {pointsPerSecond > 0 && (
                <div>
                  <div className="text-muted-foreground font-medium">
                    Points/Second
                  </div>
                  <div className="font-semibold text-purple-600">
                    {pointsPerSecond}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overall Statistics */}
          <div className="text-center text-sm text-muted-foreground">
            Total Games Played: {gamesPlayed}
          </div>
        </div>

        <DialogFooter className="gap-2">
          {onReturnToMenu && (
            <Button
              variant="outline"
              onClick={handleReturnToMenu}
              className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Menu
            </Button>
          )}
          <Button onClick={handleRestartGame} className="flex-1" autoFocus>
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </DialogFooter>

        {/* Accessibility announcements */}
        <div className="sr-only" aria-live="assertive">
          {isNewHighScore && 'Congratulations! New high score achieved!'}
          Game over. Final score: {current} points. You ate {foodEaten} food
          items in {formatTime(gameTime)}.
          {isNewHighScore
            ? 'This is your new personal best!'
            : high > 0
              ? `Your high score is ${high} points.`
              : ''}
        </div>
      </DialogContent>
    </Dialog>
  )
}
