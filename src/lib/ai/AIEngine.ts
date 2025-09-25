/**
 * Base AI decision-making engine for Snake NPC competitors
 * Provides core AI logic, pathfinding, and behavior management
 */

import {
  AIDecisionContext,
  AIDecision,
  AIPersonalityType,
  AIPersonalityConfig,
  DEFAULT_PERSONALITY_CONFIGS,
  NPCSnake,
  IAIEngine
} from '@/types/ai'
import { Direction, Position } from '@/types/game'
import { movePosition } from '@/lib/snake'

/**
 * Pathfinding result interface
 */
interface PathfindingResult {
  direction: Direction
  distance: number
  safe: boolean
}

/**
 * Base AI Engine implementation
 */
export class AIEngine implements IAIEngine {
  private personalityConfigs: Map<AIPersonalityType, AIPersonalityConfig>

  constructor(
    personalityConfigs?: Partial<Record<AIPersonalityType, AIPersonalityConfig>>
  ) {
    this.personalityConfigs = new Map()

    // Initialize with default configs
    for (const [type, config] of Object.entries(DEFAULT_PERSONALITY_CONFIGS)) {
      this.personalityConfigs.set(type as AIPersonalityType, config)
    }

    // Override with custom configs if provided
    if (personalityConfigs) {
      for (const [type, config] of Object.entries(personalityConfigs)) {
        if (config) {
          this.personalityConfigs.set(type as AIPersonalityType, config)
        }
      }
    }
  }

  /**
   * Make a decision based on current context
   */
  makeDecision(context: AIDecisionContext): AIDecision {
    const { npc } = context
    const personalityConfig = this.getPersonalityConfig(npc.personality)

    // Get all possible directions with safety assessment
    const possibleMoves = this.evaluateAllDirections(context)

    if (possibleMoves.length === 0) {
      // No safe moves available - choose least dangerous
      return this.makeDesperateDecision(context)
    }

    // Apply personality-based decision logic
    let selectedMove: PathfindingResult

    switch (npc.personality) {
      case AIPersonalityType.AGGRESSIVE:
        selectedMove = this.makeAggressiveDecision(
          context,
          possibleMoves,
          personalityConfig
        )
        break
      case AIPersonalityType.DEFENSIVE:
        selectedMove = this.makeDefensiveDecision(context, possibleMoves)
        break
      case AIPersonalityType.RANDOM:
        selectedMove = this.makeRandomDecision(possibleMoves)
        break
      case AIPersonalityType.BALANCED:
      default:
        selectedMove = this.makeBalancedDecision(
          context,
          possibleMoves,
          personalityConfig
        )
        break
    }

    return {
      direction: selectedMove.direction,
      confidence: this.calculateConfidence(
        selectedMove,
        possibleMoves,
        personalityConfig
      ),
      reasoning: this.generateReasoning(selectedMove, context)
    }
  }

  /**
   * Update AI state based on game events
   */
  updateState(npc: NPCSnake): NPCSnake {
    // For now, just return the NPC unchanged
    // This can be extended to update internal AI state, learning, etc.
    return npc
  }

  /**
   * Get personality configuration
   */
  getPersonalityConfig(personality: AIPersonalityType): AIPersonalityConfig {
    return (
      this.personalityConfigs.get(personality) ||
      DEFAULT_PERSONALITY_CONFIGS[AIPersonalityType.BALANCED]
    )
  }

  /**
   * Evaluate all possible directions and their safety
   */
  private evaluateAllDirections(
    context: AIDecisionContext
  ): PathfindingResult[] {
    const { npc, board, playerSnake, otherNPCs, foodPosition } = context
    const directions = [
      Direction.UP,
      Direction.DOWN,
      Direction.LEFT,
      Direction.RIGHT
    ]
    const results: PathfindingResult[] = []

    for (const direction of directions) {
      // Skip reverse direction
      if (this.isOppositeDirection(npc.direction, direction)) {
        continue
      }

      const nextPosition = movePosition(npc.body[0], direction)

      // Check if position is within bounds
      if (!this.isPositionInBounds(nextPosition, board)) {
        continue
      }

      // Check safety (collision avoidance)
      const safe = this.isPositionSafe(
        nextPosition,
        npc,
        playerSnake,
        otherNPCs
      )

      // Calculate distance to food
      const distance = this.calculateManhattanDistance(
        nextPosition,
        foodPosition
      )

      results.push({
        direction,
        distance,
        safe
      })
    }

    return results
  }

  /**
   * Make aggressive decision prioritizing food and risks
   */
  private makeAggressiveDecision(
    _context: AIDecisionContext,
    possibleMoves: PathfindingResult[],
    config: AIPersonalityConfig
  ): PathfindingResult {
    // Filter for safe moves first, but be more lenient
    let safeMoves = possibleMoves.filter((move) => move.safe)

    if (safeMoves.length === 0 && config.riskTolerance > 0.5) {
      // Take calculated risks for food
      safeMoves = possibleMoves
    }

    if (safeMoves.length === 0) {
      return possibleMoves[0] // Desperate move
    }

    // Prioritize moves closer to food
    return safeMoves.reduce((best, current) =>
      current.distance < best.distance ? current : best
    )
  }

  /**
   * Make defensive decision prioritizing safety
   */
  private makeDefensiveDecision(
    context: AIDecisionContext,
    possibleMoves: PathfindingResult[]
  ): PathfindingResult {
    // Strongly prefer safe moves
    const safeMoves = possibleMoves.filter((move) => move.safe)

    if (safeMoves.length === 0) {
      return possibleMoves[0] // No choice but to risk
    }

    // Among safe moves, choose one that maximizes distance from threats
    return this.chooseSafestMove(context, safeMoves)
  }

  /**
   * Make balanced decision considering both food and safety
   */
  private makeBalancedDecision(
    context: AIDecisionContext,
    possibleMoves: PathfindingResult[],
    config: AIPersonalityConfig
  ): PathfindingResult {
    const safeMoves = possibleMoves.filter((move) => move.safe)

    if (safeMoves.length === 0) {
      return possibleMoves[0]
    }

    // Score moves based on both distance to food and safety
    const scoredMoves = safeMoves.map((move) => ({
      ...move,
      score: this.calculateBalancedScore(move, context, config)
    }))

    return scoredMoves.reduce((best, current) =>
      current.score > best.score ? current : best
    )
  }

  /**
   * Make random decision with personality bias
   */
  private makeRandomDecision(
    possibleMoves: PathfindingResult[]
  ): PathfindingResult {
    const safeMoves = possibleMoves.filter((move) => move.safe)
    const movesToConsider = safeMoves.length > 0 ? safeMoves : possibleMoves

    if (movesToConsider.length === 0) {
      return possibleMoves[0]
    }

    // Add some randomness but still prefer safer/closer moves slightly
    const randomIndex = Math.floor(Math.random() * movesToConsider.length)
    return movesToConsider[randomIndex]
  }

  /**
   * Make desperate decision when no good options exist
   */
  private makeDesperateDecision(context: AIDecisionContext): AIDecision {
    const { npc } = context
    const directions = [
      Direction.UP,
      Direction.DOWN,
      Direction.LEFT,
      Direction.RIGHT
    ]

    // Try any direction that isn't opposite to current
    for (const direction of directions) {
      if (!this.isOppositeDirection(npc.direction, direction)) {
        return {
          direction,
          confidence: 0.1,
          reasoning: 'Desperate move - no safe options available'
        }
      }
    }

    // Last resort - continue straight
    return {
      direction: npc.direction,
      confidence: 0.05,
      reasoning: 'Last resort - continuing straight'
    }
  }

  /**
   * Choose the safest move among options
   */
  private chooseSafestMove(
    context: AIDecisionContext,
    safeMoves: PathfindingResult[]
  ): PathfindingResult {
    const { npc, playerSnake, otherNPCs } = context

    // Calculate threat scores for each move
    const movesWithThreatScore = safeMoves.map((move) => {
      const nextPos = movePosition(npc.body[0], move.direction)
      let threatScore = 0

      // Distance to player snake head
      if (playerSnake.length > 0) {
        const playerDistance = this.calculateManhattanDistance(
          nextPos,
          playerSnake[0]
        )
        threatScore += Math.max(0, 5 - playerDistance) // Higher threat when closer
      }

      // Distance to other NPC heads
      for (const otherNPC of otherNPCs) {
        if (otherNPC.id !== npc.id && otherNPC.body.length > 0) {
          const npcDistance = this.calculateManhattanDistance(
            nextPos,
            otherNPC.body[0]
          )
          threatScore += Math.max(0, 3 - npcDistance)
        }
      }

      return { ...move, threatScore }
    })

    // Choose move with lowest threat score
    return movesWithThreatScore.reduce((safest, current) =>
      current.threatScore < safest.threatScore ? current : safest
    )
  }

  /**
   * Calculate balanced score for decision making
   */
  private calculateBalancedScore(
    move: PathfindingResult,
    context: AIDecisionContext,
    config: AIPersonalityConfig
  ): number {
    let score = 0

    // Food proximity score (higher is better, closer to food)
    const maxDistance = context.board.width + context.board.height
    const foodScore = (maxDistance - move.distance) / maxDistance
    score += foodScore * config.foodPriority * 100

    // Safety bonus
    if (move.safe) {
      score += config.avoidancePriority * 50
    }

    return score
  }

  /**
   * Calculate confidence in decision
   */
  private calculateConfidence(
    selectedMove: PathfindingResult,
    allMoves: PathfindingResult[],
    config: AIPersonalityConfig
  ): number {
    let confidence = 0.5 // Base confidence

    // Increase confidence if move is safe
    if (selectedMove.safe) {
      confidence += 0.3
    }

    // Increase confidence if there are multiple good options
    const safeMoves = allMoves.filter((move) => move.safe)
    if (safeMoves.length > 2) {
      confidence += 0.2
    }

    // Personality-based confidence adjustments
    confidence *= config.reactionSpeedModifier

    return Math.min(1.0, Math.max(0.1, confidence))
  }

  /**
   * Generate reasoning text for debugging
   */
  private generateReasoning(
    selectedMove: PathfindingResult,
    context: AIDecisionContext
  ): string {
    const reasons: string[] = []

    reasons.push(`${context.npc.personality} personality`)

    if (selectedMove.safe) {
      reasons.push('safe move')
    } else {
      reasons.push('risky move')
    }

    reasons.push(`distance to food: ${selectedMove.distance}`)

    return reasons.join(', ')
  }

  /**
   * Check if position is within game board bounds
   */
  private isPositionInBounds(
    position: Position,
    board: { width: number; height: number }
  ): boolean {
    return (
      position.x >= 0 &&
      position.x < board.width &&
      position.y >= 0 &&
      position.y < board.height
    )
  }

  /**
   * Check if position is safe (no collisions)
   */
  private isPositionSafe(
    position: Position,
    currentNPC: NPCSnake,
    playerSnake: Position[],
    otherNPCs: NPCSnake[]
  ): boolean {
    // Check collision with current NPC's body (excluding head)
    for (let i = 1; i < currentNPC.body.length; i++) {
      if (this.positionsEqual(position, currentNPC.body[i])) {
        return false
      }
    }

    // Check collision with player snake
    for (const segment of playerSnake) {
      if (this.positionsEqual(position, segment)) {
        return false
      }
    }

    // Check collision with other NPCs
    for (const npc of otherNPCs) {
      if (npc.id === currentNPC.id) continue

      for (const segment of npc.body) {
        if (this.positionsEqual(position, segment)) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Check if two positions are equal
   */
  private positionsEqual(pos1: Position, pos2: Position): boolean {
    return pos1.x === pos2.x && pos1.y === pos2.y
  }

  /**
   * Check if direction is opposite to current direction
   */
  private isOppositeDirection(
    current: Direction,
    proposed: Direction
  ): boolean {
    const opposites: Record<Direction, Direction> = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT
    }
    return opposites[current] === proposed
  }

  /**
   * Calculate Manhattan distance between two positions
   */
  private calculateManhattanDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y)
  }
}

/**
 * Create a default AI engine instance
 */
export function createAIEngine(
  personalityConfigs?: Partial<Record<AIPersonalityType, AIPersonalityConfig>>
): AIEngine {
  return new AIEngine(personalityConfigs)
}
