'use client'

/**
 * React hook for NPC state management and updates
 * Provides reactive interface for AI-controlled NPCs in the Snake game
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  AIID,
  NPCSnake,
  AIDecisionContext,
  AIDecision,
  AIPersonalityType,
  AIDifficultyLevel,
  IAIManager,
  IAIPerformanceMonitor
} from '@/types/ai'
import { Position } from '@/types/game'
import { getAIManager } from '@/lib/ai/AIManager'
import { getPerformanceMonitor } from '@/lib/ai/AIPerformance'
import { DEFAULT_GAME_CONFIG } from '@/types/game'

/**
 * NPC hook configuration options
 */
export interface NPCHookOptions {
  /** Maximum number of NPCs to manage */
  maxNPCs?: number
  /** Enable performance monitoring */
  enablePerformanceMonitoring?: boolean
  /** Auto-update interval in milliseconds */
  updateInterval?: number
}

/**
 * NPC hook return interface
 */
export interface NPCHookResult {
  /** Current active NPCs */
  npcs: NPCSnake[]
  /** All NPCs including eliminated ones */
  allNPCs: NPCSnake[]
  /** Current AI decisions for each NPC */
  decisions: Map<AIID, AIDecision>
  /** Whether NPCs are paused */
  isPaused: boolean
  /** Create a new NPC */
  createNPC: (options?: Partial<NPCSnake>) => NPCSnake | null
  /** Remove an NPC */
  removeNPC: (id: AIID) => boolean
  /** Update NPC properties */
  updateNPC: (id: AIID, updates: Partial<NPCSnake>) => boolean
  /** Process AI decisions for all NPCs */
  processDecisions: (context: Omit<AIDecisionContext, 'npc'>) => void
  /** Update all NPC states */
  updateNPCStates: () => void
  /** Pause all NPCs */
  pauseAll: () => void
  /** Resume all NPCs */
  resumeAll: () => void
  /** Clear all NPCs */
  clearAll: () => void
  /** Eliminate an NPC (collision) */
  eliminateNPC: (id: AIID) => boolean
  /** Handle NPC food consumption */
  handleFoodConsumption: (id: AIID, foodValue: number) => boolean
  /** Get NPC statistics */
  getStatistics: () => {
    totalNPCs: number
    activeNPCs: number
    eliminatedNPCs: number
    averageScore: number
  }
}

/**
 * Custom hook for NPC state management
 */
export function useNPCs(options: NPCHookOptions = {}): NPCHookResult {
  const { maxNPCs = 4, enablePerformanceMonitoring = true } = options

  // State management
  const [npcs, setNPCs] = useState<NPCSnake[]>([])
  const [allNPCs, setAllNPCs] = useState<NPCSnake[]>([])
  const [decisions, setDecisions] = useState<Map<AIID, AIDecision>>(new Map())
  const [isPaused, setIsPaused] = useState(false)

  // Refs for managers to avoid recreation
  const aiManagerRef = useRef<IAIManager | undefined>(undefined)
  const performanceMonitorRef = useRef<IAIPerformanceMonitor | undefined>(
    undefined
  )

  // Initialize managers
  useEffect(() => {
    if (!aiManagerRef.current) {
      if (!performanceMonitorRef.current) {
        performanceMonitorRef.current = getPerformanceMonitor(
          enablePerformanceMonitoring
        )
      }
      aiManagerRef.current = getAIManager(
        undefined,
        performanceMonitorRef.current,
        DEFAULT_GAME_CONFIG.board
      )
    }
  }, [enablePerformanceMonitoring])

  // Sync state with AI manager
  const syncState = useCallback(() => {
    if (!aiManagerRef.current) return

    const activeNPCs = aiManagerRef.current.getActiveNPCs()

    // Only update if there are actual changes
    setNPCs((prevNPCs) => {
      if (
        prevNPCs.length !== activeNPCs.length ||
        !prevNPCs.every((npc, i) => npc.id === activeNPCs[i]?.id)
      ) {
        return activeNPCs
      }
      return prevNPCs
    })

    // Update all NPCs list efficiently
    setAllNPCs((prevAllNPCs) => {
      const allNPCsMap = new Map(prevAllNPCs.map((npc) => [npc.id, npc]))
      let hasChanges = false

      // Add or update active NPCs
      for (const npc of activeNPCs) {
        if (!allNPCsMap.has(npc.id) || allNPCsMap.get(npc.id) !== npc) {
          allNPCsMap.set(npc.id, npc)
          hasChanges = true
        }
      }

      return hasChanges ? Array.from(allNPCsMap.values()) : prevAllNPCs
    })

    const stats = aiManagerRef.current.getStatistics()
    setIsPaused(stats.isPaused)
  }, [])

  // Create NPC
  const createNPC = useCallback(
    (npcOptions: Partial<NPCSnake> = {}): NPCSnake | null => {
      if (!aiManagerRef.current) return null

      // Check max NPCs limit
      const stats = aiManagerRef.current.getStatistics()
      if (stats.activeNPCs >= maxNPCs) {
        console.warn(`Maximum NPCs limit reached: ${maxNPCs}`)
        return null
      }

      try {
        const npc = aiManagerRef.current.createNPC(npcOptions)
        syncState()
        return npc
      } catch (error) {
        console.error('Failed to create NPC:', error)
        return null
      }
    },
    [maxNPCs, syncState]
  )

  // Remove NPC
  const removeNPC = useCallback(
    (id: AIID): boolean => {
      if (!aiManagerRef.current) return false

      const success = aiManagerRef.current.removeNPC(id)
      if (success) {
        syncState()
      }
      return success
    },
    [syncState]
  )

  // Update NPC
  const updateNPC = useCallback(
    (id: AIID, updates: Partial<NPCSnake>): boolean => {
      if (!aiManagerRef.current) return false

      const success = aiManagerRef.current.updateNPC(id, updates)
      if (success) {
        syncState()
      }
      return success
    },
    [syncState]
  )

  // Process AI decisions
  const processDecisions = useCallback(
    (context: Omit<AIDecisionContext, 'npc'>) => {
      if (!aiManagerRef.current) return

      try {
        const newDecisions = aiManagerRef.current.processAIDecisions(context)
        setDecisions(newDecisions)
      } catch (error) {
        console.error('Failed to process AI decisions:', error)
      }
    },
    []
  )

  // Update NPC states
  const updateNPCStates = useCallback(() => {
    if (!aiManagerRef.current) return

    try {
      aiManagerRef.current.updateNPCs()
      syncState()
    } catch (error) {
      console.error('Failed to update NPC states:', error)
    }
  }, [syncState])

  // Pause all NPCs
  const pauseAll = useCallback(() => {
    if (!aiManagerRef.current) return

    aiManagerRef.current.pauseAll()
    syncState()
  }, [syncState])

  // Resume all NPCs
  const resumeAll = useCallback(() => {
    if (!aiManagerRef.current) return

    aiManagerRef.current.resumeAll()
    syncState()
  }, [syncState])

  // Clear all NPCs
  const clearAll = useCallback(() => {
    if (!aiManagerRef.current) return

    aiManagerRef.current.clearAll()
    setDecisions(new Map())
    syncState()
  }, [syncState])

  // Eliminate NPC
  const eliminateNPC = useCallback(
    (id: AIID): boolean => {
      if (!aiManagerRef.current) return false

      const success = aiManagerRef.current.eliminateNPC(id)
      if (success) {
        syncState()
      }
      return success
    },
    [syncState]
  )

  // Handle food consumption
  const handleFoodConsumption = useCallback(
    (id: AIID, foodValue: number): boolean => {
      if (!aiManagerRef.current) return false

      const success = aiManagerRef.current.handleFoodConsumption(id, foodValue)
      if (success) {
        syncState()
      }
      return success
    },
    [syncState]
  )

  // Get statistics
  const getStatistics = useCallback(() => {
    if (!aiManagerRef.current) {
      return {
        totalNPCs: 0,
        activeNPCs: 0,
        eliminatedNPCs: 0,
        averageScore: 0
      }
    }

    const stats = aiManagerRef.current.getStatistics()
    return {
      totalNPCs: stats.totalNPCs,
      activeNPCs: stats.activeNPCs,
      eliminatedNPCs: stats.eliminatedNPCs,
      averageScore: stats.averageScore
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.dispose()
      }
    }
  }, [])

  return {
    npcs,
    allNPCs,
    decisions,
    isPaused,
    createNPC,
    removeNPC,
    updateNPC,
    processDecisions,
    updateNPCStates,
    pauseAll,
    resumeAll,
    clearAll,
    eliminateNPC,
    handleFoodConsumption,
    getStatistics
  }
}

/**
 * Utility hook for creating NPCs with common configurations
 */
export function useNPCPresets() {
  const createAggressiveNPC = useCallback(
    (name?: string): Partial<NPCSnake> => ({
      name: name || 'Aggressive',
      personality: AIPersonalityType.AGGRESSIVE,
      difficulty: AIDifficultyLevel.HARD,
      speedMultiplier: 1.2
    }),
    []
  )

  const createDefensiveNPC = useCallback(
    (name?: string): Partial<NPCSnake> => ({
      name: name || 'Defensive',
      personality: AIPersonalityType.DEFENSIVE,
      difficulty: AIDifficultyLevel.MEDIUM,
      speedMultiplier: 0.9
    }),
    []
  )

  const createBalancedNPC = useCallback(
    (name?: string): Partial<NPCSnake> => ({
      name: name || 'Balanced',
      personality: AIPersonalityType.BALANCED,
      difficulty: AIDifficultyLevel.MEDIUM,
      speedMultiplier: 1.0
    }),
    []
  )

  const createRandomNPC = useCallback(
    (name?: string): Partial<NPCSnake> => ({
      name: name || 'Random',
      personality: AIPersonalityType.RANDOM,
      difficulty: AIDifficultyLevel.EASY,
      speedMultiplier: 0.8
    }),
    []
  )

  return {
    createAggressiveNPC,
    createDefensiveNPC,
    createBalancedNPC,
    createRandomNPC
  }
}

/**
 * Utility function to check if position is occupied by any NPC
 */
export function isPositionOccupiedByNPC(
  position: Position,
  npcs: NPCSnake[]
): boolean {
  return npcs.some((npc) =>
    npc.body.some(
      (segment) => segment.x === position.x && segment.y === position.y
    )
  )
}

/**
 * Utility function to find NPC at position
 */
export function findNPCAtPosition(
  position: Position,
  npcs: NPCSnake[]
): NPCSnake | undefined {
  return npcs.find((npc) =>
    npc.body.some(
      (segment) => segment.x === position.x && segment.y === position.y
    )
  )
}

/**
 * Utility function to get NPCs within a certain distance
 */
export function getNPCsNearPosition(
  position: Position,
  npcs: NPCSnake[],
  maxDistance: number
): NPCSnake[] {
  return npcs.filter((npc) => {
    if (npc.body.length === 0) return false

    const head = npc.body[0]
    const distance =
      Math.abs(head.x - position.x) + Math.abs(head.y - position.y)
    return distance <= maxDistance
  })
}
