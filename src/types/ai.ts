/**
 * Core AI type definitions for NPC competitors in Snake game
 * Provides TypeScript interfaces for AI systems, NPCs, and competitive gameplay
 */

import { Position, Direction, GameBoard } from './game'

/**
 * Unique identifier for AI entities
 */
export type AIID = string

/**
 * AI personality types that determine behavior patterns
 */
export enum AIPersonalityType {
  AGGRESSIVE = 'AGGRESSIVE',
  DEFENSIVE = 'DEFENSIVE',
  BALANCED = 'BALANCED',
  RANDOM = 'RANDOM'
}

/**
 * AI difficulty levels affecting decision-making and reaction speed
 */
export enum AIDifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  EXPERT = 'EXPERT'
}

/**
 * AI state enumeration for lifecycle management
 */
export enum AIState {
  /** AI is inactive and not processing */
  INACTIVE = 'INACTIVE',
  /** AI is active and making decisions */
  ACTIVE = 'ACTIVE',
  /** AI has been eliminated from the game */
  ELIMINATED = 'ELIMINATED',
  /** AI is paused but will resume */
  PAUSED = 'PAUSED'
}

/**
 * NPC Snake entity with AI-specific properties
 */
export interface NPCSnake {
  /** Unique identifier for the NPC */
  id: AIID
  /** Display name for the NPC */
  name: string
  /** Snake body positions, head at index 0 */
  body: Position[]
  /** Current movement direction */
  direction: Direction
  /** Next direction to move (queued direction) */
  nextDirection: Direction
  /** AI personality type */
  personality: AIPersonalityType
  /** AI difficulty level */
  difficulty: AIDifficultyLevel
  /** Current AI state */
  state: AIState
  /** Visual color for the NPC */
  color: string
  /** Current score */
  score: number
  /** Speed modifier for this NPC */
  speedMultiplier: number
}

/**
 * AI decision context providing environmental information
 */
export interface AIDecisionContext {
  /** Current NPC state */
  npc: NPCSnake
  /** Game board dimensions */
  board: GameBoard
  /** Player snake body positions */
  playerSnake: Position[]
  /** Other NPCs on the board */
  otherNPCs: NPCSnake[]
  /** Current food position */
  foodPosition: Position
  /** Game tick timestamp */
  timestamp: number
}

/**
 * AI decision output specifying the next action
 */
export interface AIDecision {
  /** Direction to move */
  direction: Direction
  /** Confidence level in the decision (0-1) */
  confidence: number
  /** Reasoning for debugging (optional) */
  reasoning?: string
}

/**
 * AI performance metrics for monitoring
 */
export interface AIPerformanceMetrics {
  /** NPC identifier */
  npcId: AIID
  /** Decision processing time in milliseconds */
  decisionTime: number
  /** Number of decisions made */
  decisionsCount: number
  /** Average decision time */
  averageDecisionTime: number
  /** Number of collisions */
  collisions: number
  /** Food consumed count */
  foodConsumed: number
  /** Time alive in milliseconds */
  timeAlive: number
  /** Last update timestamp */
  lastUpdate: number
}

/**
 * AI configuration options
 */
export interface AIConfig {
  /** Maximum number of NPCs allowed simultaneously */
  maxNPCs: number
  /** Default AI personality */
  defaultPersonality: AIPersonalityType
  /** Default difficulty level */
  defaultDifficulty: AIDifficultyLevel
  /** Performance monitoring enabled */
  performanceMonitoring: boolean
  /** Maximum AI processing time per frame in milliseconds */
  maxProcessingTime: number
  /** Enable AI decision debugging */
  debugMode: boolean
}

/**
 * AI personality configuration defining behavior parameters
 */
export interface AIPersonalityConfig {
  /** Personality type */
  type: AIPersonalityType
  /** Aggressiveness factor (0-1) */
  aggressiveness: number
  /** Risk tolerance (0-1) */
  riskTolerance: number
  /** Food pursuit priority (0-1) */
  foodPriority: number
  /** Collision avoidance priority (0-1) */
  avoidancePriority: number
  /** Territory control tendency (0-1) */
  territorialTendency: number
  /** Reaction speed modifier */
  reactionSpeedModifier: number
}

/**
 * AI Engine interface for decision-making systems
 */
export interface IAIEngine {
  /** Make a decision based on current context */
  makeDecision(context: AIDecisionContext): AIDecision
  /** Update AI state based on game events */
  updateState(npc: NPCSnake): NPCSnake
  /** Get personality configuration */
  getPersonalityConfig(personality: AIPersonalityType): AIPersonalityConfig
}

/**
 * AI Manager interface for NPC lifecycle management
 */
export interface IAIManager {
  /** Create a new NPC with specified configuration */
  createNPC(config: Partial<NPCSnake>): NPCSnake
  /** Update an existing NPC */
  updateNPC(id: AIID, updates: Partial<NPCSnake>): boolean
  /** Remove an NPC from management */
  removeNPC(id: AIID): boolean
  /** Get all active NPCs */
  getActiveNPCs(): NPCSnake[]
  /** Get specific NPC by ID */
  getNPC(id: AIID): NPCSnake | undefined
  /** Process AI decisions for all NPCs */
  processAIDecisions(
    context: Omit<AIDecisionContext, 'npc'>
  ): Map<AIID, AIDecision>
  /** Update all NPCs states */
  updateNPCs(): NPCSnake[]
  /** Pause all AI processing */
  pauseAll(): void
  /** Resume all AI processing */
  resumeAll(): void
  /** Clear all NPCs */
  clearAll(): void
  /** Get AI manager statistics */
  getStatistics(): {
    totalNPCs: number
    activeNPCs: number
    pausedNPCs: number
    eliminatedNPCs: number
    averageScore: number
    isPaused: boolean
  }
  /** Eliminate an NPC (mark as eliminated but keep for statistics) */
  eliminateNPC(id: AIID): boolean
  /** Handle NPC food consumption */
  handleFoodConsumption(id: AIID, foodValue: number): boolean
}

/**
 * AI Performance Monitor interface
 */
export interface IAIPerformanceMonitor {
  /** Start monitoring an NPC */
  startMonitoring(npcId: AIID): void
  /** Stop monitoring an NPC */
  stopMonitoring(npcId: AIID): void
  /** Record a decision timing */
  recordDecision(npcId: AIID, processingTime: number): void
  /** Record a collision event */
  recordCollision(npcId: AIID): void
  /** Record food consumption */
  recordFoodConsumed(npcId: AIID): void
  /** Get metrics for an NPC */
  getMetrics(npcId: AIID): AIPerformanceMetrics | undefined
  /** Get all metrics */
  getAllMetrics(): Map<AIID, AIPerformanceMetrics>
  /** Clear metrics for an NPC */
  clearMetrics(npcId: AIID): void
  /** Clear all metrics */
  clearAllMetrics(): void
  /** Dispose of the monitor and clean up resources */
  dispose(): void
  /** Check if monitoring is enabled */
  isEnabled(): boolean
}

/**
 * Default AI configuration values
 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  maxNPCs: 4,
  defaultPersonality: AIPersonalityType.BALANCED,
  defaultDifficulty: AIDifficultyLevel.MEDIUM,
  performanceMonitoring: true,
  maxProcessingTime: 16, // ~1 frame at 60fps
  debugMode: false
}

/**
 * Default personality configurations
 */
export const DEFAULT_PERSONALITY_CONFIGS: Record<
  AIPersonalityType,
  AIPersonalityConfig
> = {
  [AIPersonalityType.AGGRESSIVE]: {
    type: AIPersonalityType.AGGRESSIVE,
    aggressiveness: 0.8,
    riskTolerance: 0.7,
    foodPriority: 0.9,
    avoidancePriority: 0.4,
    territorialTendency: 0.6,
    reactionSpeedModifier: 1.2
  },
  [AIPersonalityType.DEFENSIVE]: {
    type: AIPersonalityType.DEFENSIVE,
    aggressiveness: 0.2,
    riskTolerance: 0.3,
    foodPriority: 0.6,
    avoidancePriority: 0.9,
    territorialTendency: 0.3,
    reactionSpeedModifier: 0.8
  },
  [AIPersonalityType.BALANCED]: {
    type: AIPersonalityType.BALANCED,
    aggressiveness: 0.5,
    riskTolerance: 0.5,
    foodPriority: 0.7,
    avoidancePriority: 0.7,
    territorialTendency: 0.5,
    reactionSpeedModifier: 1.0
  },
  [AIPersonalityType.RANDOM]: {
    type: AIPersonalityType.RANDOM,
    aggressiveness: 0.5,
    riskTolerance: 0.8,
    foodPriority: 0.5,
    avoidancePriority: 0.5,
    territorialTendency: 0.4,
    reactionSpeedModifier: 0.9
  }
}

/**
 * NPC color palette for visual distinction
 */
export const NPC_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
  '#F7DC6F' // Light Yellow
] as const

/**
 * Utility type for NPC creation options
 */
export type CreateNPCOptions = {
  name?: string
  personality?: AIPersonalityType
  difficulty?: AIDifficultyLevel
  color?: string
  position?: Position
  speedMultiplier?: number
}
