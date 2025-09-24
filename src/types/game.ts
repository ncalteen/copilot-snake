/**
 * Core game type definitions for the Snake game
 * Provides TypeScript interfaces for game state, snake, food, and coordinates
 */

/**
 * Represents a coordinate position on the game grid
 */
export interface Position {
  /** X coordinate (column) */
  x: number
  /** Y coordinate (row) */
  y: number
}

/**
 * Available movement directions for the snake
 */
export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

/**
 * Game state enumeration
 */
export enum GameState {
  /** Initial state before game starts */
  IDLE = 'IDLE',
  /** Game is actively running */
  PLAYING = 'PLAYING',
  /** Game is temporarily paused */
  PAUSED = 'PAUSED',
  /** Game has ended */
  GAME_OVER = 'GAME_OVER'
}

/**
 * Represents the snake entity with position and direction
 */
export interface Snake {
  /** Array of positions representing the snake body, head is at index 0 */
  body: Position[]
  /** Current movement direction */
  direction: Direction
  /** Next direction to move (queued direction) */
  nextDirection: Direction
}

/**
 * Represents food item on the game board
 */
export interface Food {
  /** Position of the food on the grid */
  position: Position
  /** Point value when consumed */
  value: number
}

/**
 * Game board configuration
 */
export interface GameBoard {
  /** Number of columns in the game grid */
  width: number
  /** Number of rows in the game grid */
  height: number
}

/**
 * Game configuration settings
 */
export interface GameConfig {
  /** Game board dimensions */
  board: GameBoard
  /** Initial snake speed (milliseconds per move) */
  initialSpeed: number
  /** Snake speed increment when food is consumed */
  speedIncrement: number
  /** Minimum speed limit (fastest possible) */
  minSpeed: number
}

/**
 * Complete game state interface
 */
export interface GameStateInterface {
  /** Current game state */
  state: GameState
  /** Snake entity */
  snake: Snake
  /** Food entity */
  food: Food
  /** Current score */
  score: number
  /** Current game speed (milliseconds per move) */
  speed: number
  /** Game board configuration */
  board: GameBoard
  /** Whether the game is paused */
  isPaused: boolean
}

/**
 * Game action types for state management
 */
export enum GameActionType {
  /** Start a new game */
  START_GAME = 'START_GAME',
  /** Move the snake in the current direction */
  MOVE_SNAKE = 'MOVE_SNAKE',
  /** Change snake direction */
  CHANGE_DIRECTION = 'CHANGE_DIRECTION',
  /** Consume food and grow snake */
  EAT_FOOD = 'EAT_FOOD',
  /** End the game */
  GAME_OVER = 'GAME_OVER',
  /** Pause the game */
  PAUSE_GAME = 'PAUSE_GAME',
  /** Resume the game */
  RESUME_GAME = 'RESUME_GAME',
  /** Reset game to initial state */
  RESET_GAME = 'RESET_GAME',
  /** Generate new food position */
  GENERATE_FOOD = 'GENERATE_FOOD'
}

/**
 * Game action interface for reducer pattern
 */
export interface GameAction {
  type: GameActionType
  payload?: Direction | unknown
}

/**
 * Keyboard control mapping type
 */
export type KeyboardControls = {
  /** Arrow keys mapping */
  ArrowUp: Direction.UP
  ArrowDown: Direction.DOWN
  ArrowLeft: Direction.LEFT
  ArrowRight: Direction.RIGHT
  /** WASD keys mapping */
  KeyW: Direction.UP
  KeyS: Direction.DOWN
  KeyA: Direction.LEFT
  KeyD: Direction.RIGHT
  /** Control keys */
  Space: 'PAUSE'
  KeyP: 'PAUSE'
  KeyR: 'RESTART'
  Enter: 'START'
}

/**
 * Score tracking interface
 */
export interface ScoreData {
  /** Current game score */
  current: number
  /** Highest score achieved */
  high: number
  /** Number of food items consumed in current game */
  foodEaten: number
  /** Game duration in seconds */
  gameTime: number
  /** Games played counter */
  gamesPlayed: number
}

/**
 * Default game configuration values
 */
export const DEFAULT_GAME_CONFIG: GameConfig = {
  board: {
    width: 20,
    height: 20
  },
  initialSpeed: 150,
  speedIncrement: 5,
  minSpeed: 50
}

/**
 * Initial snake configuration
 */
export const INITIAL_SNAKE: Snake = {
  body: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 }
  ],
  direction: Direction.RIGHT,
  nextDirection: Direction.RIGHT
}

/**
 * Direction opposites mapping for preventing reverse movement
 */
export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT
}
