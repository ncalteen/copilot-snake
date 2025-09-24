'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { GameState } from '@/types/game'

/**
 * Game loop configuration options
 */
interface GameLoopOptions {
  /** Game speed in milliseconds between updates (lower = faster) */
  speed: number
  /** Current game state */
  gameState: GameState
  /** Whether the game loop should be active */
  enabled?: boolean
  /** Target FPS for smooth animation (default: 60) */
  targetFPS?: number
}

/**
 * Game loop callback function type
 */
type GameLoopCallback = (deltaTime: number) => void

/**
 * Game loop statistics for performance monitoring
 */
interface GameLoopStats {
  /** Current frames per second */
  fps: number
  /** Average frame time in milliseconds */
  averageFrameTime: number
  /** Number of game ticks processed */
  tickCount: number
  /** Whether the loop is currently running */
  isRunning: boolean
}

/**
 * Custom hook for implementing a smooth 60 FPS game loop using requestAnimationFrame
 * Handles game timing, frame rate consistency, and pause/resume functionality
 *
 * @param onTick Callback function called on each game tick
 * @param options Configuration options for the game loop
 * @returns Game loop controls and statistics
 */
export function useGameLoop(
  onTick: GameLoopCallback,
  options: GameLoopOptions
) {
  const { speed, gameState, enabled = true, targetFPS = 60 } = options

  // Animation frame request ID
  const animationFrameRef = useRef<number | null>(null)

  // Timing references
  const lastTickTimeRef = useRef<number>(0)
  const lastFrameTimeRef = useRef<number>(0)
  const accumulatedTimeRef = useRef<number>(0)

  // Performance tracking
  const frameTimesRef = useRef<number[]>([])
  const tickCountRef = useRef<number>(0)

  // State for exposing statistics
  const [stats, setStats] = useState<GameLoopStats>({
    fps: 0,
    averageFrameTime: 0,
    tickCount: 0,
    isRunning: false
  })

  /**
   * Calculate and update performance statistics
   * @param currentTime Current timestamp
   */
  const updateStats = useCallback(
    (currentTime: number) => {
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = currentTime
        return
      }

      const frameTime = currentTime - lastFrameTimeRef.current
      lastFrameTimeRef.current = currentTime

      // Keep track of recent frame times for FPS calculation
      frameTimesRef.current.push(frameTime)
      if (frameTimesRef.current.length > targetFPS) {
        frameTimesRef.current.shift()
      }

      // Calculate FPS and average frame time
      const averageFrameTime =
        frameTimesRef.current.reduce((sum, time) => sum + time, 0) /
        frameTimesRef.current.length
      const fps = Math.round(1000 / averageFrameTime)

      setStats((prevStats) => ({
        ...prevStats,
        fps,
        averageFrameTime,
        tickCount: tickCountRef.current
      }))
    },
    [targetFPS]
  )

  /**
   * Main game loop function
   * @param currentTime Current timestamp from requestAnimationFrame
   */
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!enabled || gameState !== GameState.PLAYING) {
        setStats((prevStats) => ({ ...prevStats, isRunning: false }))
        return
      }

      // Update performance statistics
      updateStats(currentTime)

      // Initialize timing on first frame
      if (lastTickTimeRef.current === 0) {
        lastTickTimeRef.current = currentTime
      }

      // Calculate delta time since last frame
      const deltaTime = currentTime - lastTickTimeRef.current
      accumulatedTimeRef.current += deltaTime

      // Process game ticks based on game speed
      while (accumulatedTimeRef.current >= speed) {
        // Call the game tick callback
        onTick(speed)

        accumulatedTimeRef.current -= speed
        tickCountRef.current += 1
      }

      lastTickTimeRef.current = currentTime

      // Schedule next frame
      animationFrameRef.current = requestAnimationFrame(gameLoop)

      setStats((prevStats) => ({ ...prevStats, isRunning: true }))
    },
    [enabled, gameState, speed, onTick, updateStats]
  )

  /**
   * Start the game loop
   */
  const start = useCallback(() => {
    if (animationFrameRef.current !== null) {
      return // Already running
    }

    // Reset timing references
    lastTickTimeRef.current = 0
    lastFrameTimeRef.current = 0
    accumulatedTimeRef.current = 0
    frameTimesRef.current = []

    // Start the loop
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop])

  /**
   * Stop the game loop
   */
  const stop = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    setStats((prevStats) => ({ ...prevStats, isRunning: false }))
  }, [])

  /**
   * Pause the game loop (preserves timing state)
   */
  const pause = useCallback(() => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    setStats((prevStats) => ({ ...prevStats, isRunning: false }))
  }, [])

  /**
   * Resume the game loop from paused state
   */
  const resume = useCallback(() => {
    if (animationFrameRef.current !== null) {
      return // Already running
    }

    // Reset frame timing but preserve accumulated time
    lastTickTimeRef.current = 0
    lastFrameTimeRef.current = 0

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [gameLoop])

  /**
   * Reset the game loop timing and statistics
   */
  const reset = useCallback(() => {
    stop()

    // Reset all timing references
    lastTickTimeRef.current = 0
    lastFrameTimeRef.current = 0
    accumulatedTimeRef.current = 0
    frameTimesRef.current = []
    tickCountRef.current = 0

    setStats({
      fps: 0,
      averageFrameTime: 0,
      tickCount: 0,
      isRunning: false
    })
  }, [stop])

  /**
   * Handle game state changes automatically
   */
  useEffect(() => {
    switch (gameState) {
      case GameState.PLAYING:
        if (enabled) {
          start()
        }
        break

      case GameState.PAUSED:
        pause()
        break

      case GameState.GAME_OVER:
      case GameState.IDLE:
        stop()
        break
    }
  }, [gameState, enabled, start, pause, stop])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  /**
   * Handle speed changes - restart loop with new timing
   */
  useEffect(() => {
    if (gameState === GameState.PLAYING && enabled) {
      // Reset accumulated time when speed changes to prevent timing issues
      accumulatedTimeRef.current = 0
    }
  }, [speed, gameState, enabled])

  return {
    /** Game loop statistics and status */
    stats,
    /** Manual control functions */
    controls: {
      start,
      stop,
      pause,
      resume,
      reset
    },
    /** Current loop state */
    isRunning: stats.isRunning,
    /** Target frame rate */
    targetFPS
  }
}

/**
 * Type definition for the hook return value
 */
export type GameLoop = ReturnType<typeof useGameLoop>

/**
 * Helper hook for FPS monitoring
 * @param updateInterval How often to update FPS (in milliseconds)
 * @returns Current FPS value
 */
export function useFPSMonitor(updateInterval = 1000) {
  const [fps, setFPS] = useState(0)
  const frameCountRef = useRef(0)
  const lastUpdateRef = useRef(Date.now())

  const updateFPS = useCallback(() => {
    frameCountRef.current++

    const now = Date.now()
    const elapsed = now - lastUpdateRef.current

    if (elapsed >= updateInterval) {
      const currentFPS = Math.round((frameCountRef.current * 1000) / elapsed)
      setFPS(currentFPS)

      frameCountRef.current = 0
      lastUpdateRef.current = now
    }
  }, [updateInterval])

  useEffect(() => {
    const animationFrame = () => {
      updateFPS()
      requestAnimationFrame(animationFrame)
    }

    const frameId = requestAnimationFrame(animationFrame)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [updateFPS])

  return fps
}
