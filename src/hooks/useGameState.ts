'use client'

import { useReducer, useCallback, useEffect } from 'react'
import {
  GameStateInterface,
  GameAction,
  GameActionType,
  GameState,
  Direction,
  Position,
  DEFAULT_GAME_CONFIG,
  INITIAL_SNAKE,
  OPPOSITE_DIRECTIONS
} from '@/types/game'

/**
 * Initial game state configuration
 */
const initialGameState: GameStateInterface = {
  state: GameState.IDLE,
  snake: INITIAL_SNAKE,
  food: { position: { x: 15, y: 10 }, value: 10 },
  score: 0,
  speed: DEFAULT_GAME_CONFIG.initialSpeed,
  board: DEFAULT_GAME_CONFIG.board,
  isPaused: false
}

/**
 * Generates a random food position that doesn't collide with the snake
 * @param snake Current snake state
 * @param board Game board dimensions
 * @returns New food position
 */
function generateFoodPosition(
  snake: GameStateInterface['snake'],
  board: GameStateInterface['board']
): Position {
  const availablePositions: Position[] = []

  // Generate all possible positions
  for (let x = 0; x < board.width; x++) {
    for (let y = 0; y < board.height; y++) {
      const position = { x, y }
      // Check if position is not occupied by snake
      const isOccupied = snake.body.some(
        (segment) => segment.x === position.x && segment.y === position.y
      )
      if (!isOccupied) {
        availablePositions.push(position)
      }
    }
  }

  // Return random available position
  const randomIndex = Math.floor(Math.random() * availablePositions.length)
  return availablePositions[randomIndex] || { x: 0, y: 0 }
}

/**
 * Checks if position is within game board boundaries
 * @param position Position to check
 * @param board Game board dimensions
 * @returns True if position is valid
 */
function isValidPosition(
  position: Position,
  board: GameStateInterface['board']
): boolean {
  return (
    position.x >= 0 &&
    position.x < board.width &&
    position.y >= 0 &&
    position.y < board.height
  )
}

/**
 * Checks if snake head collides with its body
 * @param head Snake head position
 * @param body Snake body segments (excluding head)
 * @returns True if collision detected
 */
function checkSelfCollision(head: Position, body: Position[]): boolean {
  return body
    .slice(1)
    .some((segment) => segment.x === head.x && segment.y === head.y)
}

/**
 * Moves snake position based on current direction
 * @param position Current position
 * @param direction Movement direction
 * @returns New position
 */
function movePosition(position: Position, direction: Direction): Position {
  switch (direction) {
    case Direction.UP:
      return { x: position.x, y: position.y - 1 }
    case Direction.DOWN:
      return { x: position.x, y: position.y + 1 }
    case Direction.LEFT:
      return { x: position.x - 1, y: position.y }
    case Direction.RIGHT:
      return { x: position.x + 1, y: position.y }
    default:
      return position
  }
}

/**
 * Game state reducer function
 * @param state Current game state
 * @param action Dispatched action
 * @returns New game state
 */
function gameStateReducer(
  state: GameStateInterface,
  action: GameAction
): GameStateInterface {
  switch (action.type) {
    case GameActionType.START_GAME:
      return {
        ...initialGameState,
        state: GameState.PLAYING,
        food: {
          position: generateFoodPosition(
            INITIAL_SNAKE,
            DEFAULT_GAME_CONFIG.board
          ),
          value: 10
        }
      }

    case GameActionType.CHANGE_DIRECTION:
      // Prevent reverse direction movement
      if (
        OPPOSITE_DIRECTIONS[action.payload as Direction] ===
        state.snake.direction
      ) {
        return state
      }
      return {
        ...state,
        snake: {
          ...state.snake,
          nextDirection: action.payload as Direction
        }
      }

    case GameActionType.MOVE_SNAKE: {
      if (state.state !== GameState.PLAYING || state.isPaused) {
        return state
      }

      // Update direction from queued direction
      const currentDirection = state.snake.nextDirection
      const newHead = movePosition(state.snake.body[0], currentDirection)

      // Check wall collision
      if (!isValidPosition(newHead, state.board)) {
        return {
          ...state,
          state: GameState.GAME_OVER
        }
      }

      // Check self collision
      if (checkSelfCollision(newHead, state.snake.body)) {
        return {
          ...state,
          state: GameState.GAME_OVER
        }
      }

      // Create new snake body
      const newBody = [newHead, ...state.snake.body]

      // Check food consumption
      const ateFood =
        newHead.x === state.food.position.x &&
        newHead.y === state.food.position.y

      if (ateFood) {
        // Keep tail (snake grows)
        const newScore = state.score + state.food.value
        const newSpeed = Math.max(
          state.speed - DEFAULT_GAME_CONFIG.speedIncrement,
          DEFAULT_GAME_CONFIG.minSpeed
        )

        return {
          ...state,
          snake: {
            ...state.snake,
            body: newBody,
            direction: currentDirection
          },
          food: {
            position: generateFoodPosition(
              { ...state.snake, body: newBody },
              state.board
            ),
            value: 10
          },
          score: newScore,
          speed: newSpeed
        }
      } else {
        // Remove tail (normal movement)
        newBody.pop()
        return {
          ...state,
          snake: {
            ...state.snake,
            body: newBody,
            direction: currentDirection
          }
        }
      }
    }

    case GameActionType.EAT_FOOD:
      return {
        ...state,
        score: state.score + state.food.value,
        food: {
          position: generateFoodPosition(state.snake, state.board),
          value: 10
        }
      }

    case GameActionType.PAUSE_GAME:
      return {
        ...state,
        isPaused: true,
        state:
          state.state === GameState.PLAYING ? GameState.PAUSED : state.state
      }

    case GameActionType.RESUME_GAME:
      return {
        ...state,
        isPaused: false,
        state:
          state.state === GameState.PAUSED ? GameState.PLAYING : state.state
      }

    case GameActionType.GAME_OVER:
      return {
        ...state,
        state: GameState.GAME_OVER,
        isPaused: false
      }

    case GameActionType.RESET_GAME:
      return {
        ...initialGameState,
        food: {
          position: generateFoodPosition(
            INITIAL_SNAKE,
            DEFAULT_GAME_CONFIG.board
          ),
          value: 10
        }
      }

    case GameActionType.GENERATE_FOOD:
      return {
        ...state,
        food: {
          position: generateFoodPosition(state.snake, state.board),
          value: 10
        }
      }

    default:
      return state
  }
}

/**
 * Custom hook for managing game state
 * @returns Game state and dispatch functions
 */
export function useGameState() {
  const [gameState, dispatch] = useReducer(gameStateReducer, initialGameState)

  // Action creators
  const startGame = useCallback(() => {
    dispatch({ type: GameActionType.START_GAME })
  }, [])

  const changeDirection = useCallback((direction: Direction) => {
    dispatch({ type: GameActionType.CHANGE_DIRECTION, payload: direction })
  }, [])

  const moveSnake = useCallback(() => {
    dispatch({ type: GameActionType.MOVE_SNAKE })
  }, [])

  const pauseGame = useCallback(() => {
    dispatch({ type: GameActionType.PAUSE_GAME })
  }, [])

  const resumeGame = useCallback(() => {
    dispatch({ type: GameActionType.RESUME_GAME })
  }, [])

  const resetGame = useCallback(() => {
    dispatch({ type: GameActionType.RESET_GAME })
  }, [])

  const gameOver = useCallback(() => {
    dispatch({ type: GameActionType.GAME_OVER })
  }, [])

  const generateFood = useCallback(() => {
    dispatch({ type: GameActionType.GENERATE_FOOD })
  }, [])

  // Initialize food position on mount
  useEffect(() => {
    generateFood()
  }, [generateFood])

  return {
    gameState,
    actions: {
      startGame,
      changeDirection,
      moveSnake,
      pauseGame,
      resumeGame,
      resetGame,
      gameOver,
      generateFood
    }
  }
}
