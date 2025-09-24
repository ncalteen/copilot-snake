/**
 * Food generation and positioning logic
 * Handles food placement, validation, and consumption detection
 */

import { Position, Food, Snake, GameBoard } from '@/types/game'

/**
 * Generates food at random valid positions on the game grid
 * Ensures food doesn't spawn on snake body segments using rejection sampling
 * @param snake Current snake state
 * @param board Game board dimensions
 * @returns New food position
 */
export function generateFoodPosition(snake: Snake, board: GameBoard): Position {
  const availablePositions: Position[] = []

  // Generate all possible positions
  for (let x = 0; x < board.width; x++) {
    for (let y = 0; y < board.height; y++) {
      const position = { x, y }
      // Check if position is not occupied by snake
      if (!isPositionOccupiedBySnake(position, snake)) {
        availablePositions.push(position)
      }
    }
  }

  // Return random available position
  const randomIndex = Math.floor(Math.random() * availablePositions.length)
  return availablePositions[randomIndex] || { x: 0, y: 0 }
}

/**
 * Checks if a position is occupied by any part of the snake body
 * @param position Position to check
 * @param snake Snake to check against
 * @returns True if position is occupied by snake
 */
export function isPositionOccupiedBySnake(
  position: Position,
  snake: Snake
): boolean {
  return snake.body.some(
    (segment) => segment.x === position.x && segment.y === position.y
  )
}

/**
 * Checks if snake head has consumed food at current position
 * @param snakeHead Snake head position
 * @param food Food item
 * @returns True if food is consumed
 */
export function isFoodConsumed(snakeHead: Position, food: Food): boolean {
  return snakeHead.x === food.position.x && snakeHead.y === food.position.y
}

/**
 * Creates a new food item at a valid position
 * @param snake Current snake state
 * @param board Game board dimensions
 * @param value Point value for the food (default: 10)
 * @returns New food item
 */
export function createFood(
  snake: Snake,
  board: GameBoard,
  value: number = 10
): Food {
  return {
    position: generateFoodPosition(snake, board),
    value
  }
}

/**
 * Validates that a food position is valid and not occupied
 * @param position Food position to validate
 * @param snake Current snake state
 * @param board Game board dimensions
 * @returns True if position is valid for food placement
 */
export function isValidFoodPosition(
  position: Position,
  snake: Snake,
  board: GameBoard
): boolean {
  // Check if position is within board boundaries
  if (
    position.x < 0 ||
    position.x >= board.width ||
    position.y < 0 ||
    position.y >= board.height
  ) {
    return false
  }

  // Check if position is not occupied by snake
  return !isPositionOccupiedBySnake(position, snake)
}

/**
 * Gets all available positions for food placement
 * @param snake Current snake state
 * @param board Game board dimensions
 * @returns Array of all valid positions for food
 */
export function getAvailableFoodPositions(
  snake: Snake,
  board: GameBoard
): Position[] {
  const availablePositions: Position[] = []

  for (let x = 0; x < board.width; x++) {
    for (let y = 0; y < board.height; y++) {
      const position = { x, y }
      if (!isPositionOccupiedBySnake(position, snake)) {
        availablePositions.push(position)
      }
    }
  }

  return availablePositions
}
