/**
 * Multiplayer Game Manager
 * Central coordinator for managing multiplayer game state, player lifecycle,
 * and event synchronization
 */

import { GameBoard, Direction, Position, Food } from '@/types/game'
import {
  GameMode,
  PlayerEntity,
  MultiplayerMatch,
  MatchEndReason,
  PlayerIdentity
} from '@/types/multiplayer'
import { Player } from './Player'
import {
  getGameModeConfig,
  DEFAULT_PLAYER_CONFIG,
  MULTIPLAYER_SCORING
} from './multiplayerConfig'
import { createFood } from '@/lib/food'

/**
 * Event types emitted by the multiplayer game manager
 */
export enum MultiplayerEvent {
  PLAYER_READY = 'PLAYER_READY',
  PLAYER_UNREADY = 'PLAYER_UNREADY',
  MATCH_START = 'MATCH_START',
  PLAYER_SCORE = 'PLAYER_SCORE',
  PLAYER_COLLISION = 'PLAYER_COLLISION',
  PLAYER_ELIMINATED = 'PLAYER_ELIMINATED',
  MATCH_END = 'MATCH_END',
  STATE_UPDATE = 'STATE_UPDATE'
}

/**
 * Event data for multiplayer events
 */
export interface MultiplayerEventData {
  type: MultiplayerEvent
  playerId?: 1 | 2
  data?: unknown
}

/**
 * Event listener function type
 */
export type EventListener = (event: MultiplayerEventData) => void

/**
 * Multiplayer Game Manager class
 * Manages two player instances and coordinates game state
 */
export class MultiplayerGameManager {
  private player1: Player
  private player2: Player
  private gameMode: GameMode
  private board: GameBoard
  private match: MultiplayerMatch | null
  private eventListeners: Map<MultiplayerEvent, Set<EventListener>>
  private matchIdCounter: number

  /**
   * Creates a new MultiplayerGameManager instance
   * @param board Game board configuration
   * @param gameMode Initial game mode
   */
  constructor(board: GameBoard, gameMode: GameMode = GameMode.COMPETITIVE) {
    this.board = board
    this.gameMode = gameMode
    this.match = null
    this.eventListeners = new Map()
    this.matchIdCounter = 0

    // Initialize players with default configuration
    const player1Identity: PlayerIdentity = {
      id: 1,
      ...DEFAULT_PLAYER_CONFIG.player1
    }

    const player2Identity: PlayerIdentity = {
      id: 2,
      ...DEFAULT_PLAYER_CONFIG.player2
    }

    this.player1 = new Player(player1Identity, board)
    this.player2 = new Player(player2Identity, board)
  }

  /**
   * Gets the current game mode
   * @returns Active game mode
   */
  public getGameMode(): GameMode {
    return this.gameMode
  }

  /**
   * Sets the game mode
   * @param mode New game mode
   */
  public setGameMode(mode: GameMode): void {
    this.gameMode = mode
  }

  /**
   * Gets a player by ID
   * @param playerId Player ID (1 or 2)
   * @returns Player instance
   */
  public getPlayer(playerId: 1 | 2): Player {
    return playerId === 1 ? this.player1 : this.player2
  }

  /**
   * Gets both players
   * @returns Tuple of [player1, player2]
   */
  public getPlayers(): [Player, Player] {
    return [this.player1, this.player2]
  }

  /**
   * Gets the current match data
   * @returns Match data or null if no active match
   */
  public getMatch(): Readonly<MultiplayerMatch> | null {
    return this.match ? { ...this.match } : null
  }

  /**
   * Checks if both players are ready
   * @returns True if both players ready
   */
  public areBothPlayersReady(): boolean {
    return this.player1.isReady() && this.player2.isReady()
  }

  /**
   * Toggles a player's ready state
   * @param playerId Player ID to toggle
   * @returns New ready state
   */
  public togglePlayerReady(playerId: 1 | 2): boolean {
    const player = this.getPlayer(playerId)
    const newReadyState = player.toggleReady()

    this.emitEvent({
      type: newReadyState
        ? MultiplayerEvent.PLAYER_READY
        : MultiplayerEvent.PLAYER_UNREADY,
      playerId
    })

    return newReadyState
  }

  /**
   * Starts a new multiplayer match
   * @param round Round number for best-of series
   * @returns Match data
   */
  public startMatch(round: number = 1): MultiplayerMatch {
    // Reset players
    this.player1.reset(this.board)
    this.player2.reset(this.board)

    // Create new match
    this.matchIdCounter++
    this.match = {
      matchId: `match_${this.matchIdCounter}_${Date.now()}`,
      startTime: Date.now(),
      endTime: null,
      winnerId: null,
      endReason: null,
      duration: 0,
      round
    }

    this.emitEvent({
      type: MultiplayerEvent.MATCH_START,
      data: this.match
    })

    return { ...this.match }
  }

  /**
   * Ends the current match
   * @param winnerId Winner player ID or null for draw
   * @param endReason Reason for match end
   */
  public endMatch(
    winnerId: 1 | 2 | null,
    endReason: MatchEndReason
  ): MultiplayerMatch | null {
    if (!this.match) {
      return null
    }

    const endTime = Date.now()
    this.match.endTime = endTime
    this.match.winnerId = winnerId
    this.match.endReason = endReason
    this.match.duration = Math.floor((endTime - this.match.startTime) / 1000)

    this.emitEvent({
      type: MultiplayerEvent.MATCH_END,
      data: this.match
    })

    return { ...this.match }
  }

  /**
   * Moves a player's snake
   * @param playerId Player ID to move
   * @returns True if move was successful
   */
  public movePlayer(playerId: 1 | 2): boolean {
    const player = this.getPlayer(playerId)
    const otherPlayer = this.getPlayer(playerId === 1 ? 2 : 1)

    if (!player.isAlive()) {
      return false
    }

    // Execute move
    const moveSuccess = player.move(this.board)

    if (!moveSuccess) {
      this.handlePlayerCollision(playerId, MatchEndReason.WALL_COLLISION)
      return false
    }

    // Check for player-vs-player collision if mode allows
    const modeConfig = getGameModeConfig(this.gameMode)
    if (modeConfig.allowPlayerCollision) {
      if (player.checkPlayerCollision(otherPlayer)) {
        this.handlePlayerCollision(playerId, MatchEndReason.PLAYER_COLLISION)
        return false
      }
    }

    this.emitEvent({
      type: MultiplayerEvent.STATE_UPDATE
    })

    return true
  }

  /**
   * Changes a player's direction
   * @param playerId Player ID
   * @param direction New direction
   * @returns True if direction changed
   */
  public changePlayerDirection(playerId: 1 | 2, direction: Direction): boolean {
    const player = this.getPlayer(playerId)
    return player.changeDirection(direction)
  }

  /**
   * Handles food consumption by a player
   * @param playerId Player ID
   * @param foodValue Points value of food
   */
  public handleFoodConsumption(playerId: 1 | 2, foodValue: number): void {
    const player = this.getPlayer(playerId)

    // Grow snake
    player.grow(this.board)

    // Add score
    player.addScore(foodValue)

    this.emitEvent({
      type: MultiplayerEvent.PLAYER_SCORE,
      playerId,
      data: { score: player.getScore(), foodValue }
    })

    // Check win condition
    this.checkWinCondition()

    this.emitEvent({
      type: MultiplayerEvent.STATE_UPDATE
    })
  }

  /**
   * Checks if a player's head is at a food position
   * @param playerId Player ID
   * @param foodPosition Food position
   * @returns True if player consumed food
   */
  public checkFoodConsumption(
    playerId: 1 | 2,
    foodPosition: Position
  ): boolean {
    const player = this.getPlayer(playerId)
    return player.isHeadAt(foodPosition)
  }

  /**
   * Handles player collision event
   * @param playerId Player that collided
   * @param collisionType Type of collision
   */
  private handlePlayerCollision(
    playerId: 1 | 2,
    collisionType: MatchEndReason
  ): void {
    this.emitEvent({
      type: MultiplayerEvent.PLAYER_COLLISION,
      playerId,
      data: { collisionType }
    })

    this.emitEvent({
      type: MultiplayerEvent.PLAYER_ELIMINATED,
      playerId
    })

    // Check if match should end
    const modeConfig = getGameModeConfig(this.gameMode)
    if (modeConfig.endOnFirstDeath) {
      const winnerId = playerId === 1 ? 2 : 1
      this.endMatch(winnerId, collisionType)
    } else {
      // Check if both players are dead
      const otherPlayer = this.getPlayer(playerId === 1 ? 2 : 1)
      if (!otherPlayer.isAlive()) {
        // Both dead - determine winner by score
        const winner = this.determineWinnerByScore()
        this.endMatch(winner, MatchEndReason.DRAW)
      } else {
        // Other player wins
        this.endMatch(playerId === 1 ? 2 : 1, collisionType)
      }
    }
  }

  /**
   * Checks win conditions based on game mode
   */
  private checkWinCondition(): void {
    switch (this.gameMode) {
      case GameMode.COMPETITIVE: {
        // Check score limit
        const p1Score = this.player1.getScore()
        const p2Score = this.player2.getScore()

        if (p1Score >= MULTIPLAYER_SCORING.COMPETITIVE_SCORE_LIMIT) {
          this.endMatch(1, MatchEndReason.SCORE_LIMIT)
        } else if (p2Score >= MULTIPLAYER_SCORING.COMPETITIVE_SCORE_LIMIT) {
          this.endMatch(2, MatchEndReason.SCORE_LIMIT)
        }
        break
      }

      case GameMode.COOPERATIVE: {
        // Check combined score target
        const combinedScore = this.player1.getScore() + this.player2.getScore()
        if (combinedScore >= MULTIPLAYER_SCORING.COOPERATIVE_SCORE_TARGET) {
          this.endMatch(null, MatchEndReason.SCORE_LIMIT)
        }
        break
      }

      // SURVIVAL mode win is handled by collision detection
      default:
        break
    }
  }

  /**
   * Determines winner by comparing scores
   * @returns Winner player ID or null for tie
   */
  private determineWinnerByScore(): 1 | 2 | null {
    const p1Score = this.player1.getScore()
    const p2Score = this.player2.getScore()

    if (p1Score > p2Score) return 1
    if (p2Score > p1Score) return 2
    return null // Tie
  }

  /**
   * Updates game time for both players
   * @param deltaTime Time increment in seconds
   */
  public updateGameTime(deltaTime: number): void {
    if (this.player1.isAlive()) {
      this.player1.updateGameTime(deltaTime)
    }
    if (this.player2.isAlive()) {
      this.player2.updateGameTime(deltaTime)
    }

    // Update match duration
    if (this.match && !this.match.endTime) {
      this.match.duration = Math.floor(
        (Date.now() - this.match.startTime) / 1000
      )
    }
  }

  /**
   * Resets both players to initial state
   */
  public resetPlayers(): void {
    this.player1.reset(this.board)
    this.player2.reset(this.board)
    this.match = null

    this.emitEvent({
      type: MultiplayerEvent.STATE_UPDATE
    })
  }

  /**
   * Generates valid food positions avoiding both players
   * @param count Number of food items to generate
   * @returns Array of food items
   */
  public generateFood(count: number = 1): Food[] {
    const foodItems: Food[] = []

    for (let i = 0; i < count; i++) {
      // Create combined snake for collision checking
      const combinedSnake = {
        body: [
          ...this.player1.getBodyPositions(),
          ...this.player2.getBodyPositions()
        ],
        direction: this.player1.getSnake().direction,
        nextDirection: this.player1.getSnake().nextDirection
      }

      const food = createFood(
        combinedSnake,
        this.board,
        MULTIPLAYER_SCORING.FOOD_POINTS
      )
      foodItems.push(food)
    }

    return foodItems
  }

  /**
   * Registers an event listener
   * @param event Event type to listen for
   * @param listener Callback function
   */
  public addEventListener(
    event: MultiplayerEvent,
    listener: EventListener
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(listener)
  }

  /**
   * Removes an event listener
   * @param event Event type
   * @param listener Callback function to remove
   */
  public removeEventListener(
    event: MultiplayerEvent,
    listener: EventListener
  ): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.delete(listener)
    }
  }

  /**
   * Emits an event to all registered listeners
   * @param eventData Event data to emit
   */
  private emitEvent(eventData: MultiplayerEventData): void {
    const listeners = this.eventListeners.get(eventData.type)
    if (listeners) {
      listeners.forEach((listener) => listener(eventData))
    }
  }

  /**
   * Gets the current state of both players
   * @returns Tuple of player states
   */
  public getPlayerStates(): [PlayerEntity, PlayerEntity] {
    return [this.player1.getState(), this.player2.getState()]
  }

  /**
   * Cleans up resources
   */
  public destroy(): void {
    this.eventListeners.clear()
    this.match = null
  }
}
