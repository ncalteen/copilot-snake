/**
 * Multiplayer game type definitions for the Snake game
 * Provides TypeScript interfaces for multiplayer functionality,
 * player entities, and game modes
 */

import { Direction, GameState, Snake, Food, GameBoard } from '@/types/game'

/**
 * Player identification and configuration
 */
export interface PlayerIdentity {
  /** Unique player identifier (1 or 2) */
  id: 1 | 2
  /** Display name for the player */
  name: string
  /** Player's color scheme for visual differentiation */
  color: string
  /** Secondary color for highlights and effects */
  accentColor: string
}

/**
 * Player-specific statistics and score tracking
 */
export interface PlayerStats {
  /** Current score for this player */
  score: number
  /** Number of food items consumed */
  foodEaten: number
  /** Number of moves made */
  movesMade: number
  /** Longest snake length achieved */
  longestLength: number
  /** Game time in seconds for this player */
  gameTime: number
}

/**
 * Player entity representing an individual player's complete state
 */
export interface PlayerEntity {
  /** Player identification and configuration */
  identity: PlayerIdentity
  /** Player's snake state */
  snake: Snake
  /** Player-specific statistics */
  stats: PlayerStats
  /** Whether the player is ready to start */
  isReady: boolean
  /** Whether the player is currently alive */
  isAlive: boolean
  /** Whether the player has collision with walls or themselves */
  hasCollision: boolean
  /** Current input direction from player controls */
  currentInput: Direction | null
}

/**
 * Game mode types for multiplayer
 */
export enum GameMode {
  /** Standard single-player mode */
  SINGLE_PLAYER = 'SINGLE_PLAYER',
  /** Two players sharing the same board, competing for food */
  COMPETITIVE = 'COMPETITIVE',
  /** Two players on same board, working together */
  COOPERATIVE = 'COOPERATIVE',
  /** Two players, last one alive wins */
  SURVIVAL = 'SURVIVAL'
}

/**
 * Configuration for a specific game mode
 */
export interface GameModeConfig {
  /** The game mode type */
  mode: GameMode
  /** Whether players can collide with each other */
  allowPlayerCollision: boolean
  /** Whether food is shared or individual per player */
  sharedFood: boolean
  /** Maximum number of players for this mode */
  maxPlayers: number
  /** Win condition description */
  winCondition: string
  /** Whether the game ends when one player dies */
  endOnFirstDeath: boolean
}

/**
 * Player configuration for game setup
 */
export interface PlayerConfiguration {
  /** Player 1 settings */
  player1: Omit<PlayerIdentity, 'id'>
  /** Player 2 settings */
  player2: Omit<PlayerIdentity, 'id'>
  /** Control scheme for Player 1 */
  player1Controls: PlayerControls
  /** Control scheme for Player 2 */
  player2Controls: PlayerControls
}

/**
 * Keyboard control mapping for a player
 */
export interface PlayerControls {
  /** Key for moving up */
  up: string
  /** Key for moving down */
  down: string
  /** Key for moving left */
  left: string
  /** Key for moving right */
  right: string
  /** Key for ready/start */
  ready: string
}

/**
 * Extended game state for multiplayer games
 */
export interface MultiplayerGameState {
  /** Current game state */
  state: GameState
  /** Active game mode */
  gameMode: GameMode
  /** Game mode configuration */
  modeConfig: GameModeConfig
  /** Player 1 entity */
  player1: PlayerEntity
  /** Player 2 entity */
  player2: PlayerEntity
  /** Food items on the board (can be multiple in multiplayer) */
  food: Food[]
  /** Game board configuration */
  board: GameBoard
  /** Current game speed */
  speed: number
  /** Whether the game is paused */
  isPaused: boolean
  /** Match data and metadata */
  match: MultiplayerMatch | null
}

/**
 * Match data for tracking multiplayer game sessions
 */
export interface MultiplayerMatch {
  /** Unique match identifier */
  matchId: string
  /** Timestamp when match started */
  startTime: number
  /** Timestamp when match ended (null if ongoing) */
  endTime: number | null
  /** Winner player ID (null if tie or ongoing) */
  winnerId: 1 | 2 | null
  /** Reason for match end */
  endReason: MatchEndReason | null
  /** Match duration in seconds */
  duration: number
  /** Round number for best-of series */
  round: number
}

/**
 * Reasons for match ending
 */
export enum MatchEndReason {
  /** Player collision with wall */
  WALL_COLLISION = 'WALL_COLLISION',
  /** Player collision with self */
  SELF_COLLISION = 'SELF_COLLISION',
  /** Player collision with other player */
  PLAYER_COLLISION = 'PLAYER_COLLISION',
  /** Manual forfeit by player */
  FORFEIT = 'FORFEIT',
  /** Score limit reached */
  SCORE_LIMIT = 'SCORE_LIMIT',
  /** Time limit reached */
  TIME_LIMIT = 'TIME_LIMIT',
  /** Draw/tie game */
  DRAW = 'DRAW'
}

/**
 * Multiplayer game action types extending single-player actions
 */
export enum MultiplayerActionType {
  /** Initialize multiplayer game */
  INIT_MULTIPLAYER = 'INIT_MULTIPLAYER',
  /** Start multiplayer match */
  START_MATCH = 'START_MATCH',
  /** Move player 1's snake */
  MOVE_PLAYER1 = 'MOVE_PLAYER1',
  /** Move player 2's snake */
  MOVE_PLAYER2 = 'MOVE_PLAYER2',
  /** Change player 1's direction */
  CHANGE_DIRECTION_PLAYER1 = 'CHANGE_DIRECTION_PLAYER1',
  /** Change player 2's direction */
  CHANGE_DIRECTION_PLAYER2 = 'CHANGE_DIRECTION_PLAYER2',
  /** Player 1 consumes food */
  EAT_FOOD_PLAYER1 = 'EAT_FOOD_PLAYER1',
  /** Player 2 consumes food */
  EAT_FOOD_PLAYER2 = 'EAT_FOOD_PLAYER2',
  /** Player 1 ready toggle */
  TOGGLE_READY_PLAYER1 = 'TOGGLE_READY_PLAYER1',
  /** Player 2 ready toggle */
  TOGGLE_READY_PLAYER2 = 'TOGGLE_READY_PLAYER2',
  /** Player collision detected */
  PLAYER_COLLISION = 'PLAYER_COLLISION',
  /** Switch game mode */
  SWITCH_MODE = 'SWITCH_MODE',
  /** End multiplayer match */
  END_MATCH = 'END_MATCH',
  /** Reset multiplayer game */
  RESET_MULTIPLAYER = 'RESET_MULTIPLAYER',
  /** Update match statistics */
  UPDATE_MATCH_STATS = 'UPDATE_MATCH_STATS'
}

/**
 * Multiplayer game action interface for reducer pattern
 */
export interface MultiplayerAction {
  type: MultiplayerActionType
  payload?: {
    playerId?: 1 | 2
    direction?: Direction
    gameMode?: GameMode
    endReason?: MatchEndReason
    [key: string]: unknown
  }
}

/**
 * Default player colors for visual differentiation
 */
export const DEFAULT_PLAYER_COLORS = {
  player1: {
    primary: '#3B82F6', // Blue
    accent: '#60A5FA'
  },
  player2: {
    primary: '#EF4444', // Red
    accent: '#F87171'
  }
} as const

/**
 * Default control schemes for players
 */
export const DEFAULT_CONTROLS = {
  player1: {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    ready: 'Space'
  },
  player2: {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    ready: 'Enter'
  }
} as const

/**
 * Initial player statistics
 */
export const INITIAL_PLAYER_STATS: PlayerStats = {
  score: 0,
  foodEaten: 0,
  movesMade: 0,
  longestLength: 3,
  gameTime: 0
}
