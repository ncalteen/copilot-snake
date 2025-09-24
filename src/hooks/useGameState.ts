'use client'

import { useReducer, useCallback, useEffect } from 'react'
import {
  GameStateInterface,
  GameAction,
  GameActionType,
  GameState,
  Direction,
  DEFAULT_GAME_CONFIG,
  INITIAL_SNAKE
} from '@/types/game'
import {
  moveSnake,
  growSnake,
  changeSnakeDirection,
  getNextHeadPosition
} from '@/lib/snake'
import { createFood, isFoodConsumed } from '@/lib/food'
import { checkCollision } from '@/lib/collision'
import { calculateSpeedFromScore } from '@/lib/difficulty'

/**
 * Initial game state configuration
 */
const initialGameState: GameStateInterface = {
  state: GameState.IDLE,
  snake: INITIAL_SNAKE,
  food: createFood(INITIAL_SNAKE, DEFAULT_GAME_CONFIG.board),
  score: 0,
  speed: DEFAULT_GAME_CONFIG.initialSpeed,
  board: DEFAULT_GAME_CONFIG.board,
  isPaused: false
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
        food: createFood(INITIAL_SNAKE, DEFAULT_GAME_CONFIG.board)
      }

    case GameActionType.CHANGE_DIRECTION:
      return {
        ...state,
        snake: changeSnakeDirection(state.snake, action.payload as Direction)
      }

    case GameActionType.MOVE_SNAKE: {
      if (state.state !== GameState.PLAYING || state.isPaused) {
        return state
      }

      // Get next head position for collision detection
      const nextHead = getNextHeadPosition(state.snake)

      // Check for collisions
      if (checkCollision(nextHead, state.snake.body, state.board)) {
        return {
          ...state,
          state: GameState.GAME_OVER
        }
      }

      // Check food consumption
      const ateFood = isFoodConsumed(nextHead, state.food)

      if (ateFood) {
        // Snake grows when eating food
        const newSnake = growSnake(state.snake)
        const newScore = state.score + state.food.value
        const newSpeed = calculateSpeedFromScore(newScore, DEFAULT_GAME_CONFIG)

        return {
          ...state,
          snake: newSnake,
          food: createFood(newSnake, state.board),
          score: newScore,
          speed: newSpeed
        }
      } else {
        // Normal movement without growth
        return {
          ...state,
          snake: moveSnake(state.snake)
        }
      }
    }

    case GameActionType.EAT_FOOD:
      return {
        ...state,
        score: state.score + state.food.value,
        food: createFood(state.snake, state.board)
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
        food: createFood(INITIAL_SNAKE, DEFAULT_GAME_CONFIG.board)
      }

    case GameActionType.GENERATE_FOOD:
      return {
        ...state,
        food: createFood(state.snake, state.board)
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
