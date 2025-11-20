/**
 * Player entity class for multiplayer game
 * Manages individual player state, snake, statistics, and collision detection
 */

import {
  Direction,
  Snake,
  Position,
  GameBoard,
  OPPOSITE_DIRECTIONS
} from '@/types/game'
import {
  PlayerEntity,
  PlayerIdentity,
  PlayerStats,
  INITIAL_PLAYER_STATS
} from '@/types/multiplayer'
import {
  moveSnake,
  growSnake,
  changeSnakeDirection,
  getNextHeadPosition
} from '@/lib/snake'
import { checkCollision } from '@/lib/collision'
import { getPlayerSpawnPosition } from './multiplayerConfig'

/**
 * Player class encapsulating all player-specific state and behavior
 */
export class Player {
  private entity: PlayerEntity

  /**
   * Creates a new Player instance
   * @param identity Player identification and configuration
   * @param board Game board for collision detection
   */
  constructor(identity: PlayerIdentity, board?: GameBoard) {
    const spawnConfig = getPlayerSpawnPosition(identity.id)

    this.entity = {
      identity,
      snake: {
        body: [...spawnConfig.body],
        direction: identity.id === 1 ? Direction.RIGHT : Direction.LEFT,
        nextDirection: identity.id === 1 ? Direction.RIGHT : Direction.LEFT
      },
      stats: { ...INITIAL_PLAYER_STATS },
      isReady: false,
      isAlive: true,
      hasCollision: false,
      currentInput: null
    }

    // Initial collision check if board is provided
    if (board) {
      this.updateCollisionState(board)
    }
  }

  /**
   * Gets the player's complete entity state
   * @returns Immutable copy of player entity
   */
  public getState(): Readonly<PlayerEntity> {
    return {
      ...this.entity,
      identity: { ...this.entity.identity },
      snake: {
        ...this.entity.snake,
        body: [...this.entity.snake.body]
      },
      stats: { ...this.entity.stats }
    }
  }

  /**
   * Gets the player's identity
   * @returns Player identity
   */
  public getIdentity(): Readonly<PlayerIdentity> {
    return { ...this.entity.identity }
  }

  /**
   * Gets the player's snake state
   * @returns Snake state
   */
  public getSnake(): Readonly<Snake> {
    return {
      ...this.entity.snake,
      body: [...this.entity.snake.body]
    }
  }

  /**
   * Gets the player's statistics
   * @returns Player statistics
   */
  public getStats(): Readonly<PlayerStats> {
    return { ...this.entity.stats }
  }

  /**
   * Gets the player ID
   * @returns Player ID (1 or 2)
   */
  public getId(): 1 | 2 {
    return this.entity.identity.id
  }

  /**
   * Checks if the player is alive
   * @returns True if player is alive
   */
  public isAlive(): boolean {
    return this.entity.isAlive
  }

  /**
   * Checks if the player is ready
   * @returns True if player is ready
   */
  public isReady(): boolean {
    return this.entity.isReady
  }

  /**
   * Checks if the player has a collision
   * @returns True if collision detected
   */
  public hasCollision(): boolean {
    return this.entity.hasCollision
  }

  /**
   * Sets the player's ready state
   * @param ready Ready state
   */
  public setReady(ready: boolean): void {
    this.entity.isReady = ready
  }

  /**
   * Toggles the player's ready state
   * @returns New ready state
   */
  public toggleReady(): boolean {
    this.entity.isReady = !this.entity.isReady
    return this.entity.isReady
  }

  /**
   * Changes the player's snake direction
   * @param direction New direction
   * @returns True if direction was changed
   */
  public changeDirection(direction: Direction): boolean {
    // Validate direction change (prevent reversing into self)
    if (OPPOSITE_DIRECTIONS[direction] === this.entity.snake.direction) {
      return false
    }

    const updatedSnake = changeSnakeDirection(this.entity.snake, direction)

    // Check if direction actually changed
    if (updatedSnake.nextDirection !== this.entity.snake.nextDirection) {
      this.entity.snake = updatedSnake
      this.entity.currentInput = direction
      return true
    }

    return false
  }

  /**
   * Moves the player's snake one step in the current direction
   * @param board Game board for collision detection
   * @returns True if move was successful
   */
  public move(board: GameBoard): boolean {
    if (!this.entity.isAlive) {
      return false
    }

    // Check collision before moving
    const nextHead = getNextHeadPosition(this.entity.snake)
    const hasCollision = checkCollision(nextHead, this.entity.snake.body, board)

    if (hasCollision) {
      this.entity.hasCollision = true
      this.entity.isAlive = false
      return false
    }

    // Execute move
    this.entity.snake = moveSnake(this.entity.snake)
    this.entity.stats.movesMade++

    return true
  }

  /**
   * Grows the player's snake (when food is consumed)
   * @param board Game board for collision detection
   * @returns True if growth was successful
   */
  public grow(board: GameBoard): boolean {
    if (!this.entity.isAlive) {
      return false
    }

    // Execute growth
    this.entity.snake = growSnake(this.entity.snake)

    // Update collision state
    this.updateCollisionState(board)

    return true
  }

  /**
   * Adds points to the player's score
   * @param points Points to add
   */
  public addScore(points: number): void {
    this.entity.stats.score += points
    this.entity.stats.foodEaten++

    // Update longest length
    const currentLength = this.entity.snake.body.length
    if (currentLength > this.entity.stats.longestLength) {
      this.entity.stats.longestLength = currentLength
    }
  }

  /**
   * Updates the player's game time
   * @param deltaTime Time increment in seconds
   */
  public updateGameTime(deltaTime: number): void {
    this.entity.stats.gameTime += deltaTime
  }

  /**
   * Checks if the player's snake head is at a specific position
   * @param position Position to check
   * @returns True if head is at position
   */
  public isHeadAt(position: Position): boolean {
    const head = this.entity.snake.body[0]
    return head.x === position.x && head.y === position.y
  }

  /**
   * Checks if any part of the player's snake occupies a position
   * @param position Position to check
   * @returns True if snake occupies position
   */
  public occupiesPosition(position: Position): boolean {
    return this.entity.snake.body.some(
      (segment) => segment.x === position.x && segment.y === position.y
    )
  }

  /**
   * Checks for collision between this player and another player's snake
   * @param otherPlayer Other player to check collision with
   * @returns True if collision detected
   */
  public checkPlayerCollision(otherPlayer: Player): boolean {
    const head = this.entity.snake.body[0]
    const otherSnake = otherPlayer.getSnake()

    // Check if this player's head collides with other player's body
    return otherSnake.body.some(
      (segment) => segment.x === head.x && segment.y === head.y
    )
  }

  /**
   * Updates collision state for this player
   * @param board Game board for collision detection
   * @param otherPlayer Optional other player for player-vs-player collision
   */
  public updateCollisionState(board: GameBoard, otherPlayer?: Player): void {
    if (!this.entity.isAlive) {
      return
    }

    const head = this.entity.snake.body[0]
    const hasWallOrSelfCollision = checkCollision(
      head,
      this.entity.snake.body,
      board
    )

    let hasPlayerCollision = false
    if (otherPlayer) {
      hasPlayerCollision = this.checkPlayerCollision(otherPlayer)
    }

    this.entity.hasCollision = hasWallOrSelfCollision || hasPlayerCollision

    if (this.entity.hasCollision) {
      this.entity.isAlive = false
    }
  }

  /**
   * Resets the player to initial state
   * @param board Game board for collision detection
   */
  public reset(board?: GameBoard): void {
    const spawnConfig = getPlayerSpawnPosition(this.entity.identity.id)

    this.entity.snake = {
      body: [...spawnConfig.body],
      direction:
        this.entity.identity.id === 1 ? Direction.RIGHT : Direction.LEFT,
      nextDirection:
        this.entity.identity.id === 1 ? Direction.RIGHT : Direction.LEFT
    }

    this.entity.stats = { ...INITIAL_PLAYER_STATS }
    this.entity.isReady = false
    this.entity.isAlive = true
    this.entity.hasCollision = false
    this.entity.currentInput = null

    if (board) {
      this.updateCollisionState(board)
    }
  }

  /**
   * Kills the player (sets alive to false)
   */
  public kill(): void {
    this.entity.isAlive = false
    this.entity.hasCollision = true
  }

  /**
   * Gets the player's current score
   * @returns Current score
   */
  public getScore(): number {
    return this.entity.stats.score
  }

  /**
   * Gets the player's snake length
   * @returns Number of body segments
   */
  public getLength(): number {
    return this.entity.snake.body.length
  }

  /**
   * Gets the player's snake head position
   * @returns Head position
   */
  public getHeadPosition(): Readonly<Position> {
    return { ...this.entity.snake.body[0] }
  }

  /**
   * Gets all body positions of the snake
   * @returns Array of body segment positions
   */
  public getBodyPositions(): ReadonlyArray<Position> {
    return this.entity.snake.body.map((pos) => ({ ...pos }))
  }

  /**
   * Validates input for the player
   * @param direction Direction from input
   * @returns True if input is valid
   */
  public validateInput(direction: Direction): boolean {
    if (!this.entity.isAlive) {
      return false
    }

    // Check if input would cause immediate reversal
    return OPPOSITE_DIRECTIONS[direction] !== this.entity.snake.direction
  }

  /**
   * Creates a snapshot of the current player state for serialization
   * @returns Serializable player state
   */
  public toJSON(): PlayerEntity {
    return this.getState()
  }

  /**
   * Creates a Player instance from a serialized state
   * @param state Serialized player state
   * @returns New Player instance
   */
  public static fromJSON(state: PlayerEntity): Player {
    const player = new Player(state.identity)
    player.entity = {
      ...state,
      identity: { ...state.identity },
      snake: {
        ...state.snake,
        body: [...state.snake.body]
      },
      stats: { ...state.stats }
    }
    return player
  }
}
