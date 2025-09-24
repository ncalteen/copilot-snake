'use client'

import { Play, Pause, RotateCcw, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { GameState } from '@/types/game'

interface GameControlsProps {
  /** Current game state */
  gameState: GameState
  /** Whether the game is paused */
  isPaused: boolean
  /** Handler for starting a new game */
  onStartGame: () => void
  /** Handler for pausing the game */
  onPauseGame: () => void
  /** Handler for resuming the game */
  onResumeGame: () => void
  /** Handler for restarting the current game */
  onRestartGame: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Game control buttons component with start/pause/restart functionality
 * Features proper button states, keyboard shortcuts, and accessibility
 */
export function GameControls({
  gameState,
  isPaused,
  onStartGame,
  onPauseGame,
  onResumeGame,
  onRestartGame,
  className
}: GameControlsProps) {
  // Determine button states based on game state
  const isIdle = gameState === GameState.IDLE
  const isPlaying = gameState === GameState.PLAYING
  const isGameOver = gameState === GameState.GAME_OVER

  const handlePauseToggle = () => {
    if (isPaused) {
      onResumeGame()
    } else {
      onPauseGame()
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2 justify-center', className)}>
      {/* Start/Play Game Button */}
      {(isIdle || isGameOver) && (
        <Button
          onClick={onStartGame}
          variant="default"
          size="lg"
          className="min-w-[120px]"
          aria-label="Start new game (Press Enter)">
          <Play className="w-4 h-4 mr-2" />
          {isGameOver ? 'Play Again' : 'Start Game'}
        </Button>
      )}

      {/* Pause/Resume Button */}
      {isPlaying && (
        <Button
          onClick={handlePauseToggle}
          variant="secondary"
          size="lg"
          className="min-w-[120px]"
          aria-label={
            isPaused
              ? 'Resume game (Press Space or P)'
              : 'Pause game (Press Space or P)'
          }>
          {isPaused ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Resume
            </>
          ) : (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          )}
        </Button>
      )}

      {/* Restart Button */}
      {(isPlaying || isGameOver) && (
        <Button
          onClick={onRestartGame}
          variant="outline"
          size="lg"
          className="min-w-[120px]"
          aria-label="Restart game (Press R)">
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart
        </Button>
      )}

      {/* Stop Button (only when playing) */}
      {isPlaying && !isPaused && (
        <Button
          onClick={onRestartGame}
          variant="destructive"
          size="lg"
          className="min-w-[120px]"
          aria-label="Stop current game">
          <Square className="w-4 h-4 mr-2" />
          Stop
        </Button>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="w-full mt-4 text-center space-y-1">
        <div className="text-xs text-muted-foreground font-medium">
          Keyboard Shortcuts
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
              Arrow Keys
            </kbd>{' '}
            or{' '}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
              WASD
            </kbd>{' '}
            Move
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
              Space
            </kbd>{' '}
            or{' '}
            <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
              P
            </kbd>{' '}
            Pause
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
              R
            </kbd>{' '}
            Restart
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
              Enter
            </kbd>{' '}
            Start
          </span>
        </div>
      </div>

      {/* Game State Indicator for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        {isIdle && 'Game is ready to start'}
        {isPlaying && !isPaused && 'Game is currently running'}
        {isPlaying && isPaused && 'Game is paused'}
        {isGameOver && 'Game is over'}
      </div>
    </div>
  )
}
