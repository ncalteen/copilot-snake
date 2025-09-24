'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  VisualEffectsManager,
  VisualFeedback,
  ParticleEffect,
  createVisualFeedback
} from '@/lib/visualEffects'

/**
 * Visual effects hook return type
 */
interface UseVisualEffectsReturn {
  /** Active particle effects */
  particles: ParticleEffect[]
  /** Visual feedback interface */
  effects: VisualFeedback
  /** Clear all effects */
  clearEffects: () => void
}

/**
 * Custom hook for managing visual effects in the game
 */
export function useVisualEffects(): UseVisualEffectsReturn {
  const [particles, setParticles] = useState<ParticleEffect[]>([])
  const effectsManagerRef = useRef<VisualEffectsManager | null>(null)
  const visualFeedbackRef = useRef<VisualFeedback | null>(null)

  /**
   * Initialize effects manager
   */
  useEffect(() => {
    const manager = new VisualEffectsManager((updatedParticles) => {
      setParticles([...updatedParticles])
    })

    effectsManagerRef.current = manager
    visualFeedbackRef.current = createVisualFeedback(manager)

    return () => {
      manager.dispose()
    }
  }, [])

  /**
   * Clear all effects
   */
  const clearEffects = useCallback(() => {
    effectsManagerRef.current?.clearParticles()
  }, [])

  /**
   * Safe visual feedback interface
   */
  const safeEffects: VisualFeedback = {
    showFoodEffect: (x, y, score) =>
      visualFeedbackRef.current?.showFoodEffect(x, y, score),
    showCollisionEffect: (x, y) =>
      visualFeedbackRef.current?.showCollisionEffect(x, y),
    showScorePopup: (x, y, points) =>
      visualFeedbackRef.current?.showScorePopup(x, y, points),
    showMilestone: (milestone) =>
      visualFeedbackRef.current?.showMilestone(milestone)
  }

  return {
    particles,
    effects: safeEffects,
    clearEffects
  }
}

/**
 * Hook for game-specific visual effects
 * Provides convenient methods for common game visual feedback
 */
export function useGameVisualEffects() {
  const visualEffects = useVisualEffects()

  const showFoodEaten = useCallback(
    (cellX: number, cellY: number, score: number) => {
      // Convert grid coordinates to pixel coordinates (approximate)
      const pixelX = cellX * 20 + 10 // Assuming 20px cell size
      const pixelY = cellY * 20 + 10
      visualEffects.effects.showFoodEffect(pixelX, pixelY, score)
    },
    [visualEffects.effects]
  )

  const showGameOver = useCallback(
    (cellX: number, cellY: number) => {
      const pixelX = cellX * 20 + 10
      const pixelY = cellY * 20 + 10
      visualEffects.effects.showCollisionEffect(pixelX, pixelY)
    },
    [visualEffects.effects]
  )

  const showScoreIncrease = useCallback(
    (points: number) => {
      // Show at top center of screen
      visualEffects.effects.showScorePopup(window.innerWidth / 2, 100, points)
    },
    [visualEffects.effects]
  )

  return {
    ...visualEffects,
    showFoodEaten,
    showGameOver,
    showScoreIncrease
  }
}
