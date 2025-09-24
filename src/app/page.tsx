'use client'

import { useState } from 'react'
import { useGameState } from '@/hooks/useGameState'
import { useScore } from '@/hooks/useScore'
import { GameBoard } from '@/components/game/GameBoard'
import { ScoreDisplay } from '@/components/game/ScoreDisplay'
import { GameControls } from '@/components/game/GameControls'
import { GameOverModal } from '@/components/game/GameOverModal'
import { StartScreen } from '@/components/game/StartScreen'
import { MobileControls } from '@/components/game/MobileControls'
import { GameState } from '@/types/game'

export default function Home() {
  const { gameState, actions } = useGameState()
  const { scoreData, actions: scoreActions } = useScore()
  const [showGameOverModal, setShowGameOverModal] = useState(false)

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

  // Handle game over
  if (gameState.state === GameState.GAME_OVER && !showGameOverModal) {
    setShowGameOverModal(true)
    scoreActions.endGame()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Score */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-6">🐍 Snake Game</h1>
          <div className="max-w-sm mx-auto">
            <ScoreDisplay scoreData={scoreData} />
          </div>
        </div>

        {/* Game Board */}
        <div className="mb-8">
          <GameBoard gameState={gameState} className="max-w-lg mx-auto" />
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
        <div className="mb-8">
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
