/**
 * Snake movement logic and utilities
 * Implements snake movement in all four directions, growth mechanics, and direction management
 */

import { Snake, Direction, Position, OPPOSITE_DIRECTIONS } from '@/types/game'

/**
 * Moves snake position based on current direction
 * @param position Current position
 * @param direction Movement direction
 * @returns New position
 */
export function movePosition(
  position: Position,
  direction: Direction
): Position {
  switch (direction) {
    case Direction.UP:
      return { x: position.x, y: position.y - 1 }
    case Direction.DOWN:
      return { x: position.x, y: position.y + 1 }
    case Direction.LEFT:
      return { x: position.x - 1, y: position.y }
    case Direction.RIGHT:
      return { x: position.x + 1, y: position.y }
    default:
      return position
  }
}

/**
 * Updates snake body for normal movement (without growth)
 * @param snake Current snake state
 * @returns New snake with updated position
 */
export function moveSnake(snake: Snake): Snake {
  const newHead = movePosition(snake.body[0], snake.nextDirection)
  const newBody = [newHead, ...snake.body.slice(0, -1)] // Remove tail

  return {
    ...snake,
    body: newBody,
    direction: snake.nextDirection
  }
}

/**
 * Updates snake body when food is consumed (with growth)
 * @param snake Current snake state
 * @returns New snake with grown body
 */
export function growSnake(snake: Snake): Snake {
  const newHead = movePosition(snake.body[0], snake.nextDirection)
  const newBody = [newHead, ...snake.body] // Keep tail (growth)

  return {
    ...snake,
    body: newBody,
    direction: snake.nextDirection
  }
}

/**
 * Validates direction change to prevent immediate reversal
 * @param currentDirection Current snake direction
 * @param newDirection Requested new direction
 * @returns True if direction change is valid
 */
export function isValidDirectionChange(
  currentDirection: Direction,
  newDirection: Direction
): boolean {
  return OPPOSITE_DIRECTIONS[newDirection] !== currentDirection
}

/**
 * Updates snake direction if the change is valid
 * @param snake Current snake state
 * @param newDirection Requested new direction
 * @returns Snake with updated direction or unchanged snake if invalid
 */
export function changeSnakeDirection(
  snake: Snake,
  newDirection: Direction
): Snake {
  if (!isValidDirectionChange(snake.direction, newDirection)) {
    return snake
  }

  return {
    ...snake,
    nextDirection: newDirection
  }
}

/**
 * Gets the next head position without modifying the snake
 * Useful for collision detection before movement
 * @param snake Current snake state
 * @returns Position where the head will be after next move
 */
export function getNextHeadPosition(snake: Snake): Position {
  return movePosition(snake.body[0], snake.nextDirection)
}
