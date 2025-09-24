'use client'

import { Play, Trophy, Gamepad2, Smartphone, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ScoreData } from '@/types/game'

interface StartScreenProps {
  /** Score data for displaying high score and statistics */
  scoreData: ScoreData
  /** Handler for starting the game */
  onStartGame: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Welcome screen component with game instructions and statistics
 * Features responsive layout and comprehensive game guidance
 */
export function StartScreen({
  scoreData,
  onStartGame,
  className
}: StartScreenProps) {
  const { high, gamesPlayed } = scoreData

  return (
    <div
      className={cn('max-w-2xl mx-auto text-center space-y-8 p-6', className)}>
      {/* Game Title */}
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold text-primary">
          🐍 Snake Game
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          A classic arcade game built with Next.js and GitHub Copilot
        </p>
      </div>

      {/* High Score Display */}
      {high > 0 && (
        <div className="flex items-center justify-center gap-2 p-4 bg-secondary/50 rounded-lg">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="text-sm font-medium text-muted-foreground">
            High Score:
          </span>
          <span className="text-2xl font-bold text-primary">
            {high.toLocaleString()}
          </span>
        </div>
      )}

      {/* Game Statistics */}
      {gamesPlayed > 0 && (
        <div className="text-center">
          <div className="text-sm text-muted-foreground font-medium mb-1">
            Games Played
          </div>
          <div className="text-xl font-semibold text-foreground">
            {gamesPlayed}
          </div>
        </div>
      )}

      {/* Start Game Button */}
      <div className="py-4">
        <Button
          onClick={onStartGame}
          size="lg"
          className="text-lg px-8 py-4 h-auto"
          autoFocus>
          <Play className="w-5 h-5 mr-2" />
          Start Game
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Press{' '}
          <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted border border-border rounded">
            Enter
          </kbd>{' '}
          to start
        </p>
      </div>

      {/* Game Instructions */}
      <div className="grid md:grid-cols-2 gap-6 text-left">
        {/* How to Play */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            How to Play
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              Control the snake to eat food and grow longer
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              Avoid hitting walls or your own body
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              Each food item increases your score
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              The snake moves faster as you progress
            </li>
          </ul>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Controls
          </h2>
          <div className="space-y-3 text-sm">
            {/* Desktop Controls */}
            <div>
              <h3 className="font-medium text-foreground mb-2">Desktop</h3>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                    ↑ ↓ ← →
                  </kbd>
                  <span>or</span>
                  <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                    W A S D
                  </kbd>
                  <span>Move</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                    Space
                  </kbd>
                  <span>or</span>
                  <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                    P
                  </kbd>
                  <span>Pause</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded">
                    R
                  </kbd>
                  <span>Restart</span>
                </div>
              </div>
            </div>

            {/* Mobile Controls */}
            <div>
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-1">
                <Smartphone className="w-4 h-4" />
                Mobile
              </h3>
              <div className="space-y-1 text-muted-foreground">
                <div>• Touch directional buttons</div>
                <div>• Swipe gestures to change direction</div>
                <div>• Tap control buttons to pause/restart</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Pro Tips
        </h3>
        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Plan your moves ahead - don&apos;t get trapped!</li>
          <li>• Use the edges to make sharp turns</li>
          <li>• Stay calm as the speed increases</li>
          <li>• Practice makes perfect - keep playing to improve!</li>
        </ul>
      </div>

      {/* Accessibility Information */}
      <div className="sr-only">
        <p>
          Snake game start screen. Use the start game button or press Enter to
          begin playing.
        </p>
        <p>
          Game controls: Arrow keys or WASD to move, Space or P to pause, R to
          restart.
        </p>
        {high > 0 && <p>Your current high score is {high} points.</p>}
        {gamesPlayed > 0 && <p>You have played {gamesPlayed} games total.</p>}
      </div>
    </div>
  )
}
