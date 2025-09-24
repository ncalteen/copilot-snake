'use client'

import { useEffect, useCallback, useRef } from 'react'
import { Direction, GameState } from '@/types/game'

/**
 * Keyboard mapping for game controls
 */
const KEY_MAPPINGS = {
  // Arrow keys
  ArrowUp: Direction.UP,
  ArrowDown: Direction.DOWN,
  ArrowLeft: Direction.LEFT,
  ArrowRight: Direction.RIGHT,
  // WASD keys
  KeyW: Direction.UP,
  KeyS: Direction.DOWN,
  KeyA: Direction.LEFT,
  KeyD: Direction.RIGHT
} as const

/**
 * Control keys for game actions
 */
const CONTROL_KEYS = {
  Space: 'PAUSE',
  KeyP: 'PAUSE',
  KeyR: 'RESTART',
  Enter: 'START',
  Escape: 'PAUSE'
} as const

/**
 * Interface for keyboard control callbacks
 */
interface KeyboardControlCallbacks {
  /** Called when direction key is pressed */
  onDirectionChange: (direction: Direction) => void
  /** Called when pause/resume key is pressed */
  onTogglePause: () => void
  /** Called when restart key is pressed */
  onRestart: () => void
  /** Called when start key is pressed */
  onStart: () => void
}

/**
 * Interface for keyboard control options
 */
interface KeyboardControlOptions {
  /** Whether keyboard controls are enabled */
  enabled?: boolean
  /** Debounce delay in milliseconds to prevent rapid direction changes */
  debounceDelay?: number
  /** Current game state for context-aware controls */
  gameState?: GameState
}

/**
 * Custom hook for handling keyboard controls in the Snake game
 * Supports both arrow keys and WASD, with debouncing and game state awareness
 *
 * @param callbacks Object containing callback functions for different key actions
 * @param options Configuration options for keyboard controls
 */
export function useKeyboardControls(
  callbacks: KeyboardControlCallbacks,
  options: KeyboardControlOptions = {}
) {
  const {
    enabled = true,
    debounceDelay = 100,
    gameState = GameState.IDLE
  } = options

  // Track last direction change time for debouncing
  const lastDirectionChangeRef = useRef<number>(0)
  // Track current direction to prevent rapid direction changes
  const currentDirectionRef = useRef<Direction | null>(null)

  /**
   * Handles direction key presses with debouncing
   * @param direction The direction to change to
   */
  const handleDirectionChange = useCallback(
    (direction: Direction) => {
      const now = Date.now()

      // Check debounce delay
      if (now - lastDirectionChangeRef.current < debounceDelay) {
        return
      }

      // Prevent same direction spam
      if (currentDirectionRef.current === direction) {
        return
      }

      // Only allow direction changes during gameplay
      if (gameState !== GameState.PLAYING) {
        return
      }

      lastDirectionChangeRef.current = now
      currentDirectionRef.current = direction
      callbacks.onDirectionChange(direction)
    },
    [callbacks.onDirectionChange, debounceDelay, gameState]
  )

  /**
   * Handles control key presses based on current game state
   * @param action The control action to perform
   */
  const handleControlAction = useCallback(
    (action: string) => {
      switch (action) {
        case 'PAUSE':
          if (
            gameState === GameState.PLAYING ||
            gameState === GameState.PAUSED
          ) {
            callbacks.onTogglePause()
          }
          break

        case 'RESTART':
          if (
            gameState === GameState.GAME_OVER ||
            gameState === GameState.PAUSED
          ) {
            callbacks.onRestart()
          }
          break

        case 'START':
          if (
            gameState === GameState.IDLE ||
            gameState === GameState.GAME_OVER
          ) {
            callbacks.onStart()
          }
          break
      }
    },
    [callbacks, gameState]
  )

  /**
   * Main keyboard event handler
   * @param event Keyboard event
   */
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Prevent default behavior for game keys
      const isGameKey = event.code in KEY_MAPPINGS || event.code in CONTROL_KEYS
      if (isGameKey) {
        event.preventDefault()
      }

      // Handle direction keys
      if (event.code in KEY_MAPPINGS) {
        const direction = KEY_MAPPINGS[event.code as keyof typeof KEY_MAPPINGS]
        handleDirectionChange(direction)
        return
      }

      // Handle control keys
      if (event.code in CONTROL_KEYS) {
        const action = CONTROL_KEYS[event.code as keyof typeof CONTROL_KEYS]
        handleControlAction(action)
        return
      }
    },
    [enabled, handleDirectionChange, handleControlAction]
  )

  /**
   * Setup and cleanup keyboard event listeners
   */
  useEffect(() => {
    if (!enabled) return

    // Add event listener
    document.addEventListener('keydown', handleKeyPress)

    // Cleanup on unmount or when disabled
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [enabled, handleKeyPress])

  /**
   * Reset direction tracking when game state changes
   */
  useEffect(() => {
    if (gameState === GameState.IDLE || gameState === GameState.GAME_OVER) {
      currentDirectionRef.current = null
      lastDirectionChangeRef.current = 0
    }
  }, [gameState])

  /**
   * Public API for programmatic control
   */
  const controls = {
    /**
     * Simulate a direction key press
     * @param direction Direction to simulate
     */
    simulateDirectionPress: (direction: Direction) => {
      handleDirectionChange(direction)
    },

    /**
     * Simulate a control key press
     * @param action Control action to simulate
     */
    simulateControlPress: (action: 'PAUSE' | 'RESTART' | 'START') => {
      handleControlAction(action)
    },

    /**
     * Get current control state
     */
    getControlState: () => ({
      enabled,
      gameState,
      lastDirectionChange: lastDirectionChangeRef.current,
      currentDirection: currentDirectionRef.current
    })
  }

  return controls
}

/**
 * Type definitions for the hook return value
 */
export type KeyboardControls = ReturnType<typeof useKeyboardControls>

/**
 * Helper function to get human-readable key descriptions
 * @param includeWASD Whether to include WASD keys in the description
 * @returns Object with key descriptions
 */
export function getKeyDescriptions(includeWASD = true) {
  const directions = includeWASD ? 'Arrow Keys or WASD' : 'Arrow Keys'

  return {
    movement: `${directions} - Move snake`,
    pause: 'Space or P - Pause/Resume game',
    restart: 'R - Restart game (when game over or paused)',
    start: 'Enter - Start new game',
    escape: 'Escape - Pause game'
  }
}

/**
 * Hook for getting formatted control instructions
 * @param includeWASD Whether to include WASD in instructions
 * @returns Array of control instruction strings
 */
export function useControlInstructions(includeWASD = true) {
  const descriptions = getKeyDescriptions(includeWASD)

  return [
    descriptions.movement,
    descriptions.pause,
    descriptions.restart,
    descriptions.start,
    descriptions.escape
  ]
}
