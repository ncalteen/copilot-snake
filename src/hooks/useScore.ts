'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ScoreData } from '@/types/game'

/**
 * Score statistics for analysis
 */
interface ScoreStats {
  /** Average score across all games */
  averageScore: number
  /** Best game duration */
  bestGameTime: number
  /** Total food eaten across all games */
  totalFoodEaten: number
  /** Score improvement from last game */
  lastGameImprovement: number
}

/**
 * Score management options
 */
interface ScoreOptions {
  /** LocalStorage key for persistence */
  storageKey?: string
  /** Whether to auto-save to localStorage */
  autoSave?: boolean
  /** Custom score calculation function */
  calculateScore?: (foodEaten: number, gameTime: number) => number
}

/**
 * Default score calculation
 * @param foodEaten Number of food items consumed
 * @param gameTime Game duration in seconds
 * @returns Calculated score
 */
const defaultScoreCalculation = (
  foodEaten: number,
  gameTime: number
): number => {
  const baseScore = foodEaten * 10
  const timeBonus = Math.max(0, Math.floor((300 - gameTime) / 10)) // Bonus for faster completion
  return baseScore + timeBonus
}

/**
 * Default score data
 */
const defaultScoreData: ScoreData = {
  current: 0,
  high: 0,
  foodEaten: 0,
  gameTime: 0,
  gamesPlayed: 0
}

/**
 * Custom hook for managing game scores with localStorage persistence
 * Handles current score tracking, high score persistence, and game statistics
 *
 * @param options Configuration options for score management
 * @returns Score data and management functions
 */
export function useScore(options: ScoreOptions = {}) {
  const {
    storageKey = 'snake-game-scores',
    autoSave = true,
    calculateScore = defaultScoreCalculation
  } = options

  // Score state
  const [scoreData, setScoreData] = useState<ScoreData>(defaultScoreData)

  // Game timing
  const gameStartTimeRef = useRef<number>(0)
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Score history for statistics
  const [scoreHistory, setScoreHistory] = useState<number[]>([])

  /**
   * Load score data from localStorage
   */
  const loadScores = useCallback(() => {
    try {
      if (typeof window === 'undefined') return defaultScoreData

      const savedData = localStorage.getItem(storageKey)
      if (savedData) {
        const parsed = JSON.parse(savedData)
        // Ensure all required fields exist with defaults
        const loadedData: ScoreData = {
          current: 0, // Always start with 0 current score
          high: parsed.high || 0,
          foodEaten: 0, // Reset for new game
          gameTime: 0, // Reset for new game
          gamesPlayed: parsed.gamesPlayed || 0
        }
        return loadedData
      }
    } catch (error) {
      console.warn('Failed to load scores from localStorage:', error)
    }
    return defaultScoreData
  }, [storageKey])

  /**
   * Save score data to localStorage
   */
  const saveScores = useCallback(
    (data: ScoreData) => {
      if (!autoSave || typeof window === 'undefined') return

      try {
        // Only save persistent data (not current game state)
        const dataToSave = {
          high: data.high,
          gamesPlayed: data.gamesPlayed
        }
        localStorage.setItem(storageKey, JSON.stringify(dataToSave))
      } catch (error) {
        console.warn('Failed to save scores to localStorage:', error)
      }
    },
    [storageKey, autoSave]
  )

  /**
   * Save score history to localStorage
   */
  const saveScoreHistory = useCallback(
    (history: number[]) => {
      if (!autoSave || typeof window === 'undefined') return

      try {
        // Keep only last 100 scores to prevent localStorage bloat
        const historyToSave = history.slice(-100)
        localStorage.setItem(
          `${storageKey}-history`,
          JSON.stringify(historyToSave)
        )
      } catch (error) {
        console.warn('Failed to save score history:', error)
      }
    },
    [storageKey, autoSave]
  )

  /**
   * Load score history from localStorage
   */
  const loadScoreHistory = useCallback((): number[] => {
    try {
      if (typeof window === 'undefined') return []

      const savedHistory = localStorage.getItem(`${storageKey}-history`)
      if (savedHistory) {
        return JSON.parse(savedHistory)
      }
    } catch (error) {
      console.warn('Failed to load score history:', error)
    }
    return []
  }, [storageKey])

  /**
   * Initialize scores on mount
   */
  useEffect(() => {
    const loadedData = loadScores()
    const loadedHistory = loadScoreHistory()

    setScoreData(loadedData)
    setScoreHistory(loadedHistory)
  }, [loadScores, loadScoreHistory])

  /**
   * Start a new game - reset current score and start timer
   */
  const startGame = useCallback(() => {
    gameStartTimeRef.current = Date.now()

    setScoreData((prevData) => ({
      ...prevData,
      current: 0,
      foodEaten: 0,
      gameTime: 0
    }))

    // Start game timer
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current)
    }

    gameTimerRef.current = setInterval(() => {
      setScoreData((prevData) => ({
        ...prevData,
        gameTime: Math.floor((Date.now() - gameStartTimeRef.current) / 1000)
      }))
    }, 1000)
  }, [])

  /**
   * End the current game - finalize score and update records
   */
  const endGame = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current)
      gameTimerRef.current = null
    }

    setScoreData((prevData) => {
      const finalGameTime = Math.floor(
        (Date.now() - gameStartTimeRef.current) / 1000
      )
      const finalScore = calculateScore(prevData.foodEaten, finalGameTime)

      // Update high score if needed
      const newHigh = Math.max(prevData.high, finalScore)

      const updatedData: ScoreData = {
        ...prevData,
        current: finalScore,
        gameTime: finalGameTime,
        high: newHigh,
        gamesPlayed: prevData.gamesPlayed + 1
      }

      // Save to localStorage
      saveScores(updatedData)

      // Update score history
      setScoreHistory((prevHistory) => {
        const newHistory = [...prevHistory, finalScore]
        saveScoreHistory(newHistory)
        return newHistory
      })

      return updatedData
    })
  }, [calculateScore, saveScores, saveScoreHistory])

  /**
   * Add points for eating food
   */
  const eatFood = useCallback((points: number = 10) => {
    setScoreData((prevData) => ({
      ...prevData,
      current: prevData.current + points,
      foodEaten: prevData.foodEaten + 1
    }))
  }, [])

  /**
   * Add bonus points
   */
  const addBonus = useCallback((bonus: number) => {
    setScoreData((prevData) => ({
      ...prevData,
      current: prevData.current + bonus
    }))
  }, [])

  /**
   * Reset all scores (including high score)
   */
  const resetAllScores = useCallback(() => {
    const resetData = { ...defaultScoreData }
    setScoreData(resetData)
    setScoreHistory([])

    if (autoSave && typeof window !== 'undefined') {
      localStorage.removeItem(storageKey)
      localStorage.removeItem(`${storageKey}-history`)
    }
  }, [storageKey, autoSave])

  /**
   * Get score statistics
   */
  const getStats = useCallback((): ScoreStats => {
    const history = scoreHistory.length > 0 ? scoreHistory : [scoreData.current]
    const averageScore =
      history.reduce((sum, score) => sum + score, 0) / history.length

    // For now, use current game time as best time (this would be enhanced in a full implementation)
    // In a complete implementation, we would track game time for each completed game
    const bestGameTime = scoreData.gameTime

    // For now, use current game food eaten (this would be enhanced in a full implementation)
    // In a complete implementation, we would accumulate total food eaten across all games
    const totalFoodEaten = scoreData.foodEaten

    const lastGameImprovement =
      history.length > 1
        ? history[history.length - 1] - history[history.length - 2]
        : 0

    return {
      averageScore: Math.round(averageScore),
      bestGameTime,
      totalFoodEaten,
      lastGameImprovement
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreHistory])

  /**
   * Check if current score is a new high score
   */
  const isNewHighScore = useCallback(() => {
    return scoreData.current > 0 && scoreData.current >= scoreData.high
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Get score rank (percentile among all games played)
   */
  const getScoreRank = useCallback(
    (score?: number): number => {
      const targetScore = score ?? scoreData.current
      if (scoreHistory.length === 0) return 100

      const lowerScores = scoreHistory.filter((s) => s < targetScore).length
      return Math.round((lowerScores / scoreHistory.length) * 100)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scoreHistory]
  )

  /**
   * Cleanup timer on unmount
   */
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current)
      }
    }
  }, [])

  return {
    /** Current score data */
    scoreData,
    /** Score history array */
    scoreHistory,
    /** Game control functions */
    actions: {
      startGame,
      endGame,
      eatFood,
      addBonus,
      resetAllScores
    },
    /** Utility functions */
    utils: {
      getStats,
      isNewHighScore,
      getScoreRank,
      loadScores,
      saveScores: () => saveScores(scoreData)
    }
  }
}

/**
 * Type definition for the hook return value
 */
export type ScoreManager = ReturnType<typeof useScore>

/**
 * Hook for score formatting and display
 * @param score Score value to format
 * @returns Formatted score string
 */
export function useScoreFormatter() {
  const formatScore = useCallback((score: number): string => {
    return score.toLocaleString()
  }, [])

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  const formatRank = useCallback((rank: number): string => {
    const suffix =
      rank === 1 ? 'st' : rank === 2 ? 'nd' : rank === 3 ? 'rd' : 'th'
    return `${rank}${suffix} percentile`
  }, [])

  return {
    formatScore,
    formatTime,
    formatRank
  }
}
