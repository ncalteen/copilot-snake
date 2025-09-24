'use client'

import {
  HelpCircle,
  Gamepad2,
  Keyboard,
  Smartphone,
  Trophy
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GameInstructionsProps {
  /** Additional CSS classes */
  className?: string
}

/**
 * Game Instructions and Help Component
 * Comprehensive modal with game instructions, keyboard shortcuts, and tips
 */
export function GameInstructions({ className }: GameInstructionsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'flex items-center gap-2 text-muted-foreground hover:text-foreground',
            className
          )}
          aria-label="Show game instructions">
          <HelpCircle className="w-4 h-4" />
          <span className="text-xs">Help</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Gamepad2 className="w-5 h-5" />
            Snake Game Instructions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* How to Play */}
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              How to Play
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>🐍 Control the snake to eat food and grow longer</p>
              <p>🚫 Avoid hitting walls or your own body</p>
              <p>🍎 Each food item increases your score and snake length</p>
              <p>⚡ The snake moves faster as your score increases</p>
              <p>🏆 Try to beat your high score!</p>
            </div>
          </section>

          {/* Keyboard Controls */}
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-blue-500" />
              Keyboard Controls
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Movement</h4>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs">
                      ↑ ↓ ← →
                    </kbd>
                    <span>Arrow Keys</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs">
                      W A S D
                    </kbd>
                    <span>WASD Keys</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Game Controls</h4>
                <div className="space-y-1 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs">
                      Space
                    </kbd>
                    <span>Pause/Resume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs">
                      P
                    </kbd>
                    <span>Pause/Resume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs">
                      R
                    </kbd>
                    <span>Restart (when paused/game over)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs">
                      Enter
                    </kbd>
                    <span>Start New Game</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted border border-border rounded text-xs">
                      Esc
                    </kbd>
                    <span>Pause Game</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Mobile Controls */}
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-green-500" />
              Mobile Controls
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📱 Touch the directional buttons to move the snake</p>
              <p>👆 Swipe gestures also work for direction changes</p>
              <p>🎮 Tap control buttons to pause, restart, or start the game</p>
              <p>🔊 Use the sound toggle to enable/disable audio effects</p>
            </div>
          </section>

          {/* Pro Tips */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-400">
              💡 Pro Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-2 text-muted-foreground">
                <p>• Plan your moves ahead - don&apos;t get trapped!</p>
                <p>• Use the edges and corners strategically</p>
                <p>• Stay calm as the speed increases</p>
                <p>• Watch for your tail when making sharp turns</p>
              </div>
              <div className="space-y-2 text-muted-foreground">
                <p>• Create space by making wide loops</p>
                <p>• Practice smooth direction changes</p>
                <p>• Use pause strategically to plan your route</p>
                <p>• Don&apos;t rush - precision beats speed!</p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-indigo-600 dark:text-indigo-400">
              ✨ Game Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="space-y-1">
                <p>
                  🔊 <strong>Audio Effects:</strong> Sound feedback for actions
                </p>
                <p>
                  ⏸️ <strong>Auto-Pause:</strong> Game pauses when you switch
                  tabs
                </p>
                <p>
                  📊 <strong>Score Tracking:</strong> High scores and statistics
                </p>
              </div>
              <div className="space-y-1">
                <p>
                  🎨 <strong>Visual Effects:</strong> Particle effects and
                  animations
                </p>
                <p>
                  📱 <strong>Responsive:</strong> Works on desktop and mobile
                </p>
                <p>
                  ♿ <strong>Accessible:</strong> Screen reader friendly
                </p>
              </div>
            </div>
          </section>

          {/* Scoring */}
          <section className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
              🏆 Scoring System
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• Each food item gives you points (usually 10)</p>
              <p>• Your score increases with each food consumed</p>
              <p>• Game speed increases as your score grows</p>
              <p>• High scores are automatically saved</p>
              <p>• Try to beat your personal best!</p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
