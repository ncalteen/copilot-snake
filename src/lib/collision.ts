/**
 * Collision detection algorithms for the Snake game
 * Implements efficient collision detection for walls and self-collision
 */

import { Position, Snake, GameBoard } from '@/types/game'

/**
 * Detects collision between snake head and walls/boundaries
 * @param position Position to check (typically snake head)
 * @param board Game board dimensions
 * @returns True if collision with walls detected
 */
export function checkWallCollision(
  position: Position,
  board: GameBoard
): boolean {
  return (
    position.x < 0 ||
    position.x >= board.width ||
    position.y < 0 ||
    position.y >= board.height
  )
}

/**
 * Checks if a position is within valid game board boundaries
 * @param position Position to check
 * @param board Game board dimensions
 * @returns True if position is within bounds
 */
export function isValidPosition(position: Position, board: GameBoard): boolean {
  return !checkWallCollision(position, board)
}

/**
 * Detects collision between snake head and its own body (self-collision)
 * Uses early exit optimization for performance
 * @param head Snake head position
 * @param body Snake body segments (should exclude head)
 * @returns True if self-collision detected
 */
export function checkSelfCollision(head: Position, body: Position[]): boolean {
  // Skip the head itself (index 0) and check against body segments
  for (let i = 1; i < body.length; i++) {
    const segment = body[i]
    if (segment.x === head.x && segment.y === head.y) {
      return true // Early exit on first collision found
    }
  }
  return false
}

/**
 * Comprehensive collision check for snake movement
 * Combines wall collision and self-collision detection
 * @param head Snake head position
 * @param body Snake body segments
 * @param board Game board dimensions
 * @returns True if any collision detected
 */
export function checkCollision(
  head: Position,
  body: Position[],
  board: GameBoard
): boolean {
  return checkWallCollision(head, board) || checkSelfCollision(head, body)
}

/**
 * Checks if snake head collides with its body using the full snake object
 * @param snake Snake object containing head and body
 * @returns True if self-collision detected
 */
export function checkSnakeSelfCollision(snake: Snake): boolean {
  const head = snake.body[0]
  const bodySegments = snake.body.slice(1) // Exclude head
  return checkSelfCollision(head, bodySegments)
}

/**
 * Checks if snake collides with walls using the full snake object
 * @param snake Snake object containing head position
 * @param board Game board dimensions
 * @returns True if wall collision detected
 */
export function checkSnakeWallCollision(
  snake: Snake,
  board: GameBoard
): boolean {
  const head = snake.body[0]
  return checkWallCollision(head, board)
}

/**
 * Comprehensive collision check using snake object
 * @param snake Snake object to check
 * @param board Game board dimensions
 * @returns True if any collision detected
 */
export function checkSnakeCollision(snake: Snake, board: GameBoard): boolean {
  return checkSnakeWallCollision(snake, board) || checkSnakeSelfCollision(snake)
}

/**
 * Checks if two positions are the same (collision between objects)
 * @param pos1 First position
 * @param pos2 Second position
 * @returns True if positions are equal
 */
export function checkPositionCollision(
  pos1: Position,
  pos2: Position
): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y
}

/**
 * Checks if a position collides with any position in an array
 * Useful for checking collisions with multiple objects
 * @param position Position to check
 * @param positions Array of positions to check against
 * @returns True if collision with any position in array
 */
export function checkPositionArrayCollision(
  position: Position,
  positions: Position[]
): boolean {
  return positions.some((pos) => checkPositionCollision(position, pos))
}
