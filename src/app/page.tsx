'use client'

import React, { useState, useEffect } from 'react'
import { useGameState } from '@/hooks/useGameState'
import { useScore } from '@/hooks/useScore'
import { useKeyboardControls } from '@/hooks/useKeyboardControls'
import { useGameLoop } from '@/hooks/useGameLoop'
import { useGameAudio } from '@/hooks/useAudio'
import { useGameVisualEffects } from '@/hooks/useVisualEffects'
import { useTabVisibility } from '@/hooks/useTabVisibility'
import { GameBoard } from '@/components/game/GameBoard'
import { ScoreDisplay } from '@/components/game/ScoreDisplay'
import { GameControls } from '@/components/game/GameControls'
import { GameOverModal } from '@/components/game/GameOverModal'
import { StartScreen } from '@/components/game/StartScreen'
import { MobileControls } from '@/components/game/MobileControls'
import { ParticleEffects } from '@/components/game/ParticleEffects'
import { AudioControl } from '@/components/game/AudioControl'
import { PauseOverlay } from '@/components/game/PauseOverlay'
import { GameInstructions } from '@/components/game/GameInstructions'
import { GameState } from '@/types/game'

export default function Home() {
  const { gameState, actions } = useGameState()
  const { scoreData, actions: scoreActions } = useScore()
  const [showGameOverModal, setShowGameOverModal] = useState(false)

  // Audio and visual effects
  const audio = useGameAudio()
  const visualEffects = useGameVisualEffects()

  // Tab visibility for auto-pause
  const isTabVisible = useTabVisibility()
  const [wasAutoPaused, setWasAutoPaused] = React.useState(false)

  // Keyboard controls callbacks
  const keyboardCallbacks = {
    onDirectionChange: actions.changeDirection,
    onTogglePause: gameState.isPaused ? actions.resumeGame : actions.pauseGame,
    onRestart: () => {
      actions.resetGame()
      scoreActions.startGame()
      setShowGameOverModal(false)
    },
    onStart: () => {
      actions.startGame()
      scoreActions.startGame()
    }
  }

  // Setup keyboard controls
  useKeyboardControls(keyboardCallbacks, {
    enabled: true,
    gameState: gameState.state,
    debounceDelay: 100
  })

  // Setup game loop to move snake automatically
  useGameLoop(actions.moveSnake, {
    speed: gameState.speed,
    gameState: gameState.state,
    enabled: gameState.state === GameState.PLAYING && !gameState.isPaused
  })

  // Handle game over with useEffect to avoid setState during render
  React.useEffect(() => {
    if (gameState.state === GameState.GAME_OVER && !showGameOverModal) {
      setShowGameOverModal(true)
      scoreActions.endGame()

      // Play game over sound and show visual effect
      audio.playGameOverSound()
      if (gameState.snake.body.length > 0) {
        const head = gameState.snake.body[0]
        visualEffects.showGameOver(head.x, head.y)
      }
    }
  }, [
    gameState.state,
    showGameOverModal,
    scoreActions,
    audio,
    visualEffects,
    gameState.snake.body
  ])

  // Handle food consumption for audio/visual feedback
  const prevSnakeLengthRef = React.useRef(gameState.snake.body.length)
  React.useEffect(() => {
    if (gameState.snake.body.length > prevSnakeLengthRef.current) {
      // Snake grew - food was eaten
      const points = gameState.food.value
      audio.playFoodSound()

      // Show visual effect at food position
      visualEffects.showFoodEaten(
        gameState.food.position.x,
        gameState.food.position.y,
        points
      )
      visualEffects.showScoreIncrease(points)

      prevSnakeLengthRef.current = gameState.snake.body.length
    }
  }, [gameState.snake.body.length, gameState.food, audio, visualEffects])

  // Initialize audio on game start
  React.useEffect(() => {
    if (gameState.state === GameState.PLAYING && !audio.isReady) {
      audio.initialize()
    }
  }, [gameState.state, audio])

  // Auto-pause when tab becomes invisible
  React.useEffect(() => {
    if (
      gameState.state === GameState.PLAYING &&
      !gameState.isPaused &&
      !isTabVisible
    ) {
      actions.pauseGame()
      setWasAutoPaused(true)
    }
  }, [isTabVisible, gameState.state, gameState.isPaused, actions])

  // Clear auto-pause flag when game resumes
  React.useEffect(() => {
    if (!gameState.isPaused) {
      setWasAutoPaused(false)
    }
  }, [gameState.isPaused])

  // Manage body class for preventing scrolling on mobile during gameplay
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (gameState.state === GameState.PLAYING && !gameState.isPaused) {
      document.body.classList.add('game-active')
    } else {
      document.body.classList.remove('game-active')
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('game-active')
    }
  }, [gameState.state, gameState.isPaused])

  // Show start screen when game is idle
  if (gameState.state === GameState.IDLE) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <StartScreen
            scoreData={scoreData}
            onStartGame={() => {
              actions.startGame()
              scoreActions.startGame()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header with Score */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <GameInstructions />
            <h1 className="text-3xl font-bold text-center">🐍 Snake Game</h1>
            <AudioControl
              soundEnabled={audio.settings.soundEnabled}
              isReady={audio.isReady}
              isSupported={audio.isSupported}
              onToggle={audio.toggleSound}
            />
          </div>
          <div className="max-w-sm mx-auto">
            <ScoreDisplay scoreData={scoreData} />
          </div>
        </div>

        {/* Game Board */}
        <div className="mb-4 sm:mb-8 relative">
          <GameBoard gameState={gameState} />
          <ParticleEffects
            particles={visualEffects.particles}
            className="max-w-sm mx-auto sm:max-w-lg"
          />
          <PauseOverlay
            visible={
              gameState.isPaused && gameState.state === GameState.PLAYING
            }
            isAutoPause={wasAutoPaused}
            onResume={actions.resumeGame}
            className="max-w-sm mx-auto sm:max-w-lg"
          />
        </div>

        {/* Game Controls */}
        <div className="mb-8">
          <GameControls
            gameState={gameState.state}
            isPaused={gameState.isPaused}
            onStartGame={() => {
              actions.startGame()
              scoreActions.startGame()
            }}
            onPauseGame={actions.pauseGame}
            onResumeGame={actions.resumeGame}
            onRestartGame={() => {
              actions.resetGame()
              scoreActions.startGame()
              setShowGameOverModal(false)
            }}
          />
        </div>

        {/* Mobile Controls */}
        <div className="mb-4 sm:mb-8">
          <MobileControls
            onDirectionChange={actions.changeDirection}
            disabled={
              gameState.state !== GameState.PLAYING || gameState.isPaused
            }
          />
        </div>

        {/* Game Over Modal */}
        <GameOverModal
          open={showGameOverModal}
          onOpenChange={setShowGameOverModal}
          scoreData={scoreData}
          onRestartGame={() => {
            actions.resetGame()
            setShowGameOverModal(false)
            actions.startGame()
            scoreActions.startGame()
          }}
          onReturnToMenu={() => {
            actions.resetGame()
            setShowGameOverModal(false)
          }}
        />
      </div>
    </div>
  )
}
