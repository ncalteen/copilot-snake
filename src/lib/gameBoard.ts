/**
 * Game board utilities and grid management
 * Provides coordinate system utilities and position validation
 */

import { Position, GameBoard } from '@/types/game'

/**
 * Creates a new game board configuration
 * @param width Number of columns in the game grid
 * @param height Number of rows in the game grid
 * @returns GameBoard configuration object
 */
export function createGameBoard(width: number, height: number): GameBoard {
  return { width, height }
}

/**
 * Calculates the total number of positions on the game board
 * @param board Game board dimensions
 * @returns Total number of grid positions
 */
export function getBoardSize(board: GameBoard): number {
  return board.width * board.height
}

/**
 * Converts grid coordinates to a linear index
 * Useful for array-based board representations
 * @param position Grid position
 * @param board Game board dimensions
 * @returns Linear index for the position
 */
export function positionToIndex(position: Position, board: GameBoard): number {
  return position.y * board.width + position.x
}

/**
 * Converts linear index back to grid coordinates
 * @param index Linear index
 * @param board Game board dimensions
 * @returns Grid position
 */
export function indexToPosition(index: number, board: GameBoard): Position {
  return {
    x: index % board.width,
    y: Math.floor(index / board.width)
  }
}

/**
 * Checks if a position is within the game board boundaries
 * @param position Position to validate
 * @param board Game board dimensions
 * @returns True if position is valid
 */
export function isValidBoardPosition(
  position: Position,
  board: GameBoard
): boolean {
  return (
    position.x >= 0 &&
    position.x < board.width &&
    position.y >= 0 &&
    position.y < board.height
  )
}

/**
 * Gets the center position of the game board
 * @param board Game board dimensions
 * @returns Center position (rounded down if dimensions are even)
 */
export function getBoardCenter(board: GameBoard): Position {
  return {
    x: Math.floor(board.width / 2),
    y: Math.floor(board.height / 2)
  }
}

/**
 * Gets all positions around the board edges (border positions)
 * @param board Game board dimensions
 * @returns Array of all border positions
 */
export function getBorderPositions(board: GameBoard): Position[] {
  const borders: Position[] = []

  // Top and bottom borders
  for (let x = 0; x < board.width; x++) {
    borders.push({ x, y: 0 }) // Top border
    borders.push({ x, y: board.height - 1 }) // Bottom border
  }

  // Left and right borders (excluding corners already added)
  for (let y = 1; y < board.height - 1; y++) {
    borders.push({ x: 0, y }) // Left border
    borders.push({ x: board.width - 1, y }) // Right border
  }

  return borders
}

/**
 * Gets all valid positions on the game board
 * @param board Game board dimensions
 * @returns Array of all valid positions
 */
export function getAllBoardPositions(board: GameBoard): Position[] {
  const positions: Position[] = []

  for (let y = 0; y < board.height; y++) {
    for (let x = 0; x < board.width; x++) {
      positions.push({ x, y })
    }
  }

  return positions
}

/**
 * Calculates Manhattan distance between two positions
 * @param pos1 First position
 * @param pos2 Second position
 * @returns Manhattan distance
 */
export function getManhattanDistance(pos1: Position, pos2: Position): number {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y)
}

/**
 * Calculates Euclidean distance between two positions
 * @param pos1 First position
 * @param pos2 Second position
 * @returns Euclidean distance
 */
export function getEuclideanDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x
  const dy = pos1.y - pos2.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Gets neighboring positions (4-directional: up, down, left, right)
 * @param position Center position
 * @param board Game board dimensions (optional, for boundary checking)
 * @returns Array of neighboring positions (only valid positions if board provided)
 */
export function getNeighborPositions(
  position: Position,
  board?: GameBoard
): Position[] {
  const neighbors: Position[] = [
    { x: position.x, y: position.y - 1 }, // Up
    { x: position.x, y: position.y + 1 }, // Down
    { x: position.x - 1, y: position.y }, // Left
    { x: position.x + 1, y: position.y } // Right
  ]

  // Filter only valid positions if board dimensions provided
  if (board) {
    return neighbors.filter((pos) => isValidBoardPosition(pos, board))
  }

  return neighbors
}

/**
 * Wraps position coordinates to stay within board boundaries (toroidal topology)
 * @param position Position to wrap
 * @param board Game board dimensions
 * @returns Wrapped position
 */
export function wrapPosition(position: Position, board: GameBoard): Position {
  return {
    x: ((position.x % board.width) + board.width) % board.width,
    y: ((position.y % board.height) + board.height) % board.height
  }
}

/**
 * Clamps position coordinates to stay within board boundaries
 * @param position Position to clamp
 * @param board Game board dimensions
 * @returns Clamped position
 */
export function clampPosition(position: Position, board: GameBoard): Position {
  return {
    x: Math.max(0, Math.min(position.x, board.width - 1)),
    y: Math.max(0, Math.min(position.y, board.height - 1))
  }
}
