'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { GameStateInterface } from '@/types/game'

interface GameBoardProps {
  /** Game state containing snake, food, and board dimensions */
  gameState: GameStateInterface
  /** Additional CSS classes */
  className?: string
}

/**
 * Main game rendering component for the Snake game board
 * Renders grid, snake segments, and food items with responsive design
 */
export function GameBoard({ gameState, className }: GameBoardProps) {
  const { snake, food, board } = gameState

  // Create grid cells for rendering
  const gridCells = useMemo(() => {
    const cells: Array<{
      x: number
      y: number
      type: 'empty' | 'snake-head' | 'snake-body' | 'food'
    }> = []

    // Generate all grid positions
    for (let y = 0; y < board.height; y++) {
      for (let x = 0; x < board.width; x++) {
        let type: 'empty' | 'snake-head' | 'snake-body' | 'food' = 'empty'

        // Check if this position is the snake head
        if (
          snake.body.length > 0 &&
          snake.body[0].x === x &&
          snake.body[0].y === y
        ) {
          type = 'snake-head'
        }
        // Check if this position is part of snake body
        else if (
          snake.body.some(
            (segment, index) => index > 0 && segment.x === x && segment.y === y
          )
        ) {
          type = 'snake-body'
        }
        // Check if this position has food
        else if (food.position.x === x && food.position.y === y) {
          type = 'food'
        }

        cells.push({ x, y, type })
      }
    }

    return cells
  }, [snake.body, food.position, board.width, board.height])

  return (
    <div
      className={cn(
        'relative bg-secondary border border-border rounded-lg p-2 shadow-sm',
        'aspect-square max-w-full max-h-[min(80vh,80vw)]',
        'mx-auto',
        className
      )}
      role="img"
      aria-label={`Game board with snake at position ${snake.body[0]?.x}, ${snake.body[0]?.y} and food at ${food.position.x}, ${food.position.y}`}>
      <div
        className="grid gap-px bg-border rounded p-1"
        style={{
          gridTemplateColumns: `repeat(${board.width}, 1fr)`,
          gridTemplateRows: `repeat(${board.height}, 1fr)`
        }}>
        {gridCells.map((cell) => (
          <div
            key={`${cell.x}-${cell.y}`}
            className={cn(
              'aspect-square rounded-sm transition-colors duration-75',
              {
                'bg-background': cell.type === 'empty',
                'bg-primary animate-pulse': cell.type === 'snake-head',
                'bg-primary/80': cell.type === 'snake-body',
                'bg-destructive animate-bounce': cell.type === 'food'
              }
            )}
            data-testid={`cell-${cell.x}-${cell.y}`}
            data-type={cell.type}
          />
        ))}
      </div>

      {/* Game state overlay for accessibility */}
      <div className="sr-only">
        <p>
          Snake game board with {board.width} by {board.height} grid
        </p>
        <p>Snake length: {snake.body.length} segments</p>
        <p>
          Food position: column {food.position.x + 1}, row {food.position.y + 1}
        </p>
        <p>
          Snake head position: column {snake.body[0]?.x + 1}, row{' '}
          {snake.body[0]?.y + 1}
        </p>
      </div>
    </div>
  )
}
