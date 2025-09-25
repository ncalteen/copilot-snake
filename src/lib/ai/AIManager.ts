/**
 * AI Manager for NPC lifecycle management and coordination
 * Handles NPC creation, updates, destruction, and AI decision processing
 */

import {
  AIID,
  NPCSnake,
  AIDecisionContext,
  AIDecision,
  AIState,
  AIPersonalityType,
  AIDifficultyLevel,
  CreateNPCOptions,
  DEFAULT_AI_CONFIG,
  NPC_COLORS,
  IAIManager,
  IAIEngine,
  IAIPerformanceMonitor
} from '@/types/ai'
import { Direction, Position } from '@/types/game'
import { AIEngine } from './AIEngine'
import { getPerformanceMonitor, measureAIDecision } from './AIPerformance'

/**
 * AI Manager implementation for NPC lifecycle management
 */
export class AIManager implements IAIManager {
  private npcs: Map<AIID, NPCSnake> = new Map()
  private aiEngine: IAIEngine
  private performanceMonitor: IAIPerformanceMonitor
  private isPaused: boolean = false
  private npcCounter: number = 0

  constructor(
    aiEngine?: IAIEngine,
    performanceMonitor?: IAIPerformanceMonitor
  ) {
    this.aiEngine = aiEngine || new AIEngine()
    this.performanceMonitor = performanceMonitor || getPerformanceMonitor()
  }

  /**
   * Create a new NPC with specified configuration
   */
  createNPC(config: Partial<NPCSnake> = {}): NPCSnake {
    // Generate unique ID
    const id = this.generateNPCId()

    // Assign default values
    const options: CreateNPCOptions = {
      name: config.name || this.generateNPCName(),
      personality: config.personality || DEFAULT_AI_CONFIG.defaultPersonality,
      difficulty: config.difficulty || DEFAULT_AI_CONFIG.defaultDifficulty,
      color: config.color || this.assignNPCColor(),
      position: config.body?.[0] || this.generateStartPosition(),
      speedMultiplier:
        config.speedMultiplier ||
        this.calculateSpeedMultiplier(
          config.difficulty || DEFAULT_AI_CONFIG.defaultDifficulty
        )
    }

    // Create NPC snake
    const npc: NPCSnake = {
      id,
      name: options.name!,
      body: config.body || [
        options.position!,
        { x: options.position!.x - 1, y: options.position!.y },
        { x: options.position!.x - 2, y: options.position!.y }
      ],
      direction: config.direction || Direction.RIGHT,
      nextDirection: config.nextDirection || Direction.RIGHT,
      personality: options.personality!,
      difficulty: options.difficulty!,
      state: config.state || AIState.ACTIVE,
      color: options.color!,
      score: config.score || 0,
      speedMultiplier: options.speedMultiplier!
    }

    // Add to management
    this.npcs.set(id, npc)

    // Start performance monitoring
    this.performanceMonitor.startMonitoring(id)

    return npc
  }

  /**
   * Update an existing NPC
   */
  updateNPC(id: AIID, updates: Partial<NPCSnake>): boolean {
    const npc = this.npcs.get(id)
    if (!npc) {
      return false
    }

    // Apply updates
    const updatedNPC: NPCSnake = { ...npc, ...updates }
    this.npcs.set(id, updatedNPC)

    return true
  }

  /**
   * Remove an NPC from management
   */
  removeNPC(id: AIID): boolean {
    const existed = this.npcs.has(id)
    if (existed) {
      this.npcs.delete(id)
      this.performanceMonitor.stopMonitoring(id)
    }
    return existed
  }

  /**
   * Get all active NPCs
   */
  getActiveNPCs(): NPCSnake[] {
    return Array.from(this.npcs.values()).filter(
      (npc) => npc.state === AIState.ACTIVE
    )
  }

  /**
   * Get specific NPC by ID
   */
  getNPC(id: AIID): NPCSnake | undefined {
    return this.npcs.get(id)
  }

  /**
   * Process AI decisions for all NPCs
   */
  processAIDecisions(
    context: Omit<AIDecisionContext, 'npc'>
  ): Map<AIID, AIDecision> {
    const decisions = new Map<AIID, AIDecision>()

    if (this.isPaused) {
      return decisions
    }

    const activeNPCs = this.getActiveNPCs()

    for (const npc of activeNPCs) {
      // Create decision context for this NPC
      const npcContext: AIDecisionContext = {
        ...context,
        npc,
        otherNPCs: activeNPCs.filter((other) => other.id !== npc.id)
      }

      try {
        // Measure AI decision performance
        const decision = measureAIDecision(
          npc.id,
          () => this.aiEngine.makeDecision(npcContext),
          this.performanceMonitor
        )

        decisions.set(npc.id, decision)
      } catch (error) {
        console.warn(`AI decision failed for NPC ${npc.id}:`, error)

        // Fallback decision
        decisions.set(npc.id, {
          direction: npc.direction,
          confidence: 0.1,
          reasoning: `Error fallback: ${error}`
        })
      }
    }

    return decisions
  }

  /**
   * Update all NPCs states
   */
  updateNPCs(): NPCSnake[] {
    if (this.isPaused) {
      return this.getActiveNPCs()
    }

    const activeNPCs = this.getActiveNPCs()
    const updatedNPCs: NPCSnake[] = []

    for (const npc of activeNPCs) {
      try {
        // Update NPC state through AI engine
        const updatedNPC = this.aiEngine.updateState(npc)
        this.npcs.set(npc.id, updatedNPC)
        updatedNPCs.push(updatedNPC)
      } catch (error) {
        console.warn(`NPC state update failed for ${npc.id}:`, error)
        updatedNPCs.push(npc) // Keep original state
      }
    }

    return updatedNPCs
  }

  /**
   * Pause all AI processing
   */
  pauseAll(): void {
    this.isPaused = true

    // Update all NPCs to paused state
    for (const [id, npc] of this.npcs.entries()) {
      if (npc.state === AIState.ACTIVE) {
        this.npcs.set(id, { ...npc, state: AIState.PAUSED })
      }
    }
  }

  /**
   * Resume all AI processing
   */
  resumeAll(): void {
    this.isPaused = false

    // Update all NPCs to active state
    for (const [id, npc] of this.npcs.entries()) {
      if (npc.state === AIState.PAUSED) {
        this.npcs.set(id, { ...npc, state: AIState.ACTIVE })
      }
    }
  }

  /**
   * Clear all NPCs
   */
  clearAll(): void {
    // Stop monitoring all NPCs
    for (const id of this.npcs.keys()) {
      this.performanceMonitor.stopMonitoring(id)
    }

    this.npcs.clear()
    this.npcCounter = 0
    this.isPaused = false
  }

  /**
   * Get AI manager statistics
   */
  getStatistics(): {
    totalNPCs: number
    activeNPCs: number
    pausedNPCs: number
    eliminatedNPCs: number
    averageScore: number
    isPaused: boolean
  } {
    const allNPCs = Array.from(this.npcs.values())
    const activeNPCs = allNPCs.filter((npc) => npc.state === AIState.ACTIVE)
    const pausedNPCs = allNPCs.filter((npc) => npc.state === AIState.PAUSED)
    const eliminatedNPCs = allNPCs.filter(
      (npc) => npc.state === AIState.ELIMINATED
    )

    const totalScore = allNPCs.reduce((sum, npc) => sum + npc.score, 0)
    const averageScore = allNPCs.length > 0 ? totalScore / allNPCs.length : 0

    return {
      totalNPCs: allNPCs.length,
      activeNPCs: activeNPCs.length,
      pausedNPCs: pausedNPCs.length,
      eliminatedNPCs: eliminatedNPCs.length,
      averageScore,
      isPaused: this.isPaused
    }
  }

  /**
   * Eliminate an NPC (mark as eliminated but keep for statistics)
   */
  eliminateNPC(id: AIID): boolean {
    const npc = this.npcs.get(id)
    if (!npc) {
      return false
    }

    // Update state to eliminated
    this.npcs.set(id, { ...npc, state: AIState.ELIMINATED })

    // Record collision in performance monitor
    this.performanceMonitor.recordCollision(id)

    return true
  }

  /**
   * Handle NPC food consumption
   */
  handleFoodConsumption(id: AIID, foodValue: number): boolean {
    const npc = this.npcs.get(id)
    if (!npc) {
      return false
    }

    // Update score
    const updatedNPC = { ...npc, score: npc.score + foodValue }
    this.npcs.set(id, updatedNPC)

    // Record in performance monitor
    this.performanceMonitor.recordFoodConsumed(id)

    return true
  }

  /**
   * Generate unique NPC ID
   */
  private generateNPCId(): AIID {
    return `npc_${++this.npcCounter}_${Date.now()}`
  }

  /**
   * Generate NPC name
   */
  private generateNPCName(): string {
    const names = [
      'Alpha',
      'Beta',
      'Gamma',
      'Delta',
      'Echo',
      'Foxtrot',
      'Viper',
      'Cobra',
      'Python',
      'Mamba',
      'Boa',
      'Adder',
      'Swift',
      'Quick',
      'Flash',
      'Dash',
      'Bolt',
      'Zoom',
      'Hunter',
      'Prowler',
      'Stalker',
      'Shadow',
      'Ghost',
      'Phantom'
    ]
    return names[Math.floor(Math.random() * names.length)]
  }

  /**
   * Assign NPC color from available palette
   */
  private assignNPCColor(): string {
    const usedColors = new Set(
      Array.from(this.npcs.values()).map((npc) => npc.color)
    )

    // Find first available color
    for (const color of NPC_COLORS) {
      if (!usedColors.has(color)) {
        return color
      }
    }

    // If all colors used, cycle through them
    return NPC_COLORS[this.npcs.size % NPC_COLORS.length]
  }

  /**
   * Generate starting position for NPC
   */
  private generateStartPosition(): Position {
    // Simple random position - should be enhanced to avoid collisions
    return {
      x: Math.floor(Math.random() * 15) + 3, // Avoid edges
      y: Math.floor(Math.random() * 15) + 3
    }
  }

  /**
   * Calculate speed multiplier based on difficulty
   */
  private calculateSpeedMultiplier(difficulty: AIDifficultyLevel): number {
    switch (difficulty) {
      case AIDifficultyLevel.EASY:
        return 0.8
      case AIDifficultyLevel.MEDIUM:
        return 1.0
      case AIDifficultyLevel.HARD:
        return 1.2
      case AIDifficultyLevel.EXPERT:
        return 1.5
      default:
        return 1.0
    }
  }
}

/**
 * Global AI manager instance
 */
let aiManagerInstance: AIManager | null = null

/**
 * Get or create the global AI manager instance
 */
export function getAIManager(
  aiEngine?: IAIEngine,
  performanceMonitor?: IAIPerformanceMonitor
): AIManager {
  if (!aiManagerInstance) {
    aiManagerInstance = new AIManager(aiEngine, performanceMonitor)
  }
  return aiManagerInstance
}

/**
 * Create multiple NPCs with different configurations
 */
export function createMultipleNPCs(
  count: number,
  manager: AIManager,
  options: Partial<CreateNPCOptions> = {}
): NPCSnake[] {
  const npcs: NPCSnake[] = []
  const personalities = Object.values(AIPersonalityType)
  const difficulties = Object.values(AIDifficultyLevel)

  for (let i = 0; i < count; i++) {
    const npcOptions: Partial<NPCSnake> = {
      ...options,
      personality:
        options.personality || personalities[i % personalities.length],
      difficulty: options.difficulty || difficulties[i % difficulties.length]
    }

    const npc = manager.createNPC(npcOptions)
    npcs.push(npc)
  }

  return npcs
}
