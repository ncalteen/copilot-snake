/**
 * Multiplayer game configuration and constants
 * Centralizes all multiplayer-specific settings, rules, and optimization parameters
 */

import { Position } from '@/types/game'
import {
  GameMode,
  GameModeConfig,
  PlayerConfiguration,
  PlayerControls,
  DEFAULT_PLAYER_COLORS,
  DEFAULT_CONTROLS
} from '@/types/multiplayer'

/**
 * Performance optimization constants
 */
export const PERFORMANCE_CONFIG = {
  /** Target frames per second for smooth gameplay */
  TARGET_FPS: 60,
  /** Collision detection interval in milliseconds */
  COLLISION_CHECK_INTERVAL: 16, // ~60 FPS
  /** Maximum number of food items on board at once */
  MAX_FOOD_ITEMS: 10,
  /** Debounce time for input handling in milliseconds */
  INPUT_DEBOUNCE_MS: 10
} as const

/**
 * Initial spawn positions for players to prevent immediate collision
 */
export const PLAYER_SPAWN_POSITIONS = {
  player1: {
    head: { x: 5, y: 10 } as Position,
    body: [
      { x: 5, y: 10 },
      { x: 4, y: 10 },
      { x: 3, y: 10 }
    ] as Position[]
  },
  player2: {
    head: { x: 15, y: 10 } as Position,
    body: [
      { x: 15, y: 10 },
      { x: 16, y: 10 },
      { x: 17, y: 10 }
    ] as Position[]
  }
} as const

/**
 * Player visual themes and colors
 */
export const PLAYER_THEMES = {
  player1: {
    name: 'Player 1',
    color: DEFAULT_PLAYER_COLORS.player1.primary,
    accentColor: DEFAULT_PLAYER_COLORS.player1.accent,
    borderStyle: 'solid',
    glowEffect: true
  },
  player2: {
    name: 'Player 2',
    color: DEFAULT_PLAYER_COLORS.player2.primary,
    accentColor: DEFAULT_PLAYER_COLORS.player2.accent,
    borderStyle: 'solid',
    glowEffect: true
  }
} as const

/**
 * Default player configuration
 */
export const DEFAULT_PLAYER_CONFIG: PlayerConfiguration = {
  player1: {
    name: PLAYER_THEMES.player1.name,
    color: PLAYER_THEMES.player1.color,
    accentColor: PLAYER_THEMES.player1.accentColor
  },
  player2: {
    name: PLAYER_THEMES.player2.name,
    color: PLAYER_THEMES.player2.color,
    accentColor: PLAYER_THEMES.player2.accentColor
  },
  player1Controls: DEFAULT_CONTROLS.player1 as PlayerControls,
  player2Controls: DEFAULT_CONTROLS.player2 as PlayerControls
}

/**
 * Game mode configurations
 */
export const GAME_MODE_CONFIGS: Record<GameMode, GameModeConfig> = {
  [GameMode.SINGLE_PLAYER]: {
    mode: GameMode.SINGLE_PLAYER,
    allowPlayerCollision: false,
    sharedFood: true,
    maxPlayers: 1,
    winCondition: 'Achieve the highest score',
    endOnFirstDeath: true
  },
  [GameMode.COMPETITIVE]: {
    mode: GameMode.COMPETITIVE,
    allowPlayerCollision: true,
    sharedFood: true,
    maxPlayers: 2,
    winCondition: 'First to reach score limit or last player alive',
    endOnFirstDeath: false
  },
  [GameMode.COOPERATIVE]: {
    mode: GameMode.COOPERATIVE,
    allowPlayerCollision: false,
    sharedFood: true,
    maxPlayers: 2,
    winCondition: 'Combined score reaches target',
    endOnFirstDeath: true
  },
  [GameMode.SURVIVAL]: {
    mode: GameMode.SURVIVAL,
    allowPlayerCollision: true,
    sharedFood: true,
    maxPlayers: 2,
    winCondition: 'Last player alive wins',
    endOnFirstDeath: false
  }
}

/**
 * Multiplayer scoring configuration
 */
export const MULTIPLAYER_SCORING = {
  /** Points for consuming food */
  FOOD_POINTS: 10,
  /** Bonus points for eliminating opponent */
  ELIMINATION_BONUS: 50,
  /** Points per second survived in survival mode */
  SURVIVAL_POINTS_PER_SECOND: 1,
  /** Score limit for competitive mode */
  COMPETITIVE_SCORE_LIMIT: 100,
  /** Combined score target for cooperative mode */
  COOPERATIVE_SCORE_TARGET: 200
} as const

/**
 * Multiplayer audio event configuration
 */
export const MULTIPLAYER_AUDIO_EVENTS = {
  /** Sound when player becomes ready */
  PLAYER_READY: 'player_ready',
  /** Sound when match starts */
  MATCH_START: 'match_start',
  /** Sound when player scores */
  PLAYER_SCORE: 'player_score',
  /** Sound when player is eliminated */
  PLAYER_ELIMINATED: 'player_eliminated',
  /** Sound when match ends */
  MATCH_END: 'match_end',
  /** Sound for player collision */
  PLAYER_COLLISION: 'player_collision',
  /** Sound when both players ready */
  ALL_READY: 'all_ready'
} as const

/**
 * Match timing configuration
 */
export const MATCH_TIMING = {
  /** Countdown duration before match starts (seconds) */
  COUNTDOWN_DURATION: 3,
  /** Maximum match duration in seconds (0 = unlimited) */
  MAX_MATCH_DURATION: 300, // 5 minutes
  /** Time to show results after match ends (seconds) */
  RESULTS_DISPLAY_DURATION: 5,
  /** Grace period at start where collisions don't count (milliseconds) */
  GRACE_PERIOD_MS: 1000
} as const

/**
 * Visual effect settings for multiplayer
 */
export const MULTIPLAYER_VISUAL_EFFECTS = {
  /** Enable particle effects for player actions */
  ENABLE_PARTICLES: true,
  /** Enable screen shake on collision */
  ENABLE_SCREEN_SHAKE: true,
  /** Enable player trails */
  ENABLE_TRAILS: true,
  /** Trail length in segments */
  TRAIL_LENGTH: 5,
  /** Opacity of trail segments */
  TRAIL_OPACITY: 0.6,
  /** Enable winner animation */
  ENABLE_WINNER_ANIMATION: true
} as const

/**
 * Food generation rules for multiplayer
 */
export const MULTIPLAYER_FOOD_CONFIG = {
  /** Minimum distance from any player when spawning food */
  MIN_SPAWN_DISTANCE_FROM_PLAYER: 3,
  /** Number of food items in competitive mode */
  COMPETITIVE_FOOD_COUNT: 2,
  /** Number of food items in cooperative mode */
  COOPERATIVE_FOOD_COUNT: 3,
  /** Food respawn delay in milliseconds */
  RESPAWN_DELAY_MS: 500,
  /** Enable special food items in multiplayer */
  ENABLE_SPECIAL_FOOD: false
} as const

/**
 * Helper function to get game mode configuration
 * @param mode The game mode
 * @returns Game mode configuration
 */
export function getGameModeConfig(mode: GameMode): GameModeConfig {
  return GAME_MODE_CONFIGS[mode]
}

/**
 * Helper function to check if game mode is multiplayer
 * @param mode The game mode
 * @returns True if mode requires multiple players
 */
export function isMultiplayerMode(mode: GameMode): boolean {
  return mode !== GameMode.SINGLE_PLAYER
}

/**
 * Helper function to get player spawn position
 * @param playerId Player ID (1 or 2)
 * @returns Spawn position configuration
 */
export function getPlayerSpawnPosition(playerId: 1 | 2) {
  return playerId === 1
    ? PLAYER_SPAWN_POSITIONS.player1
    : PLAYER_SPAWN_POSITIONS.player2
}

/**
 * Helper function to get player theme
 * @param playerId Player ID (1 or 2)
 * @returns Player theme configuration
 */
export function getPlayerTheme(playerId: 1 | 2) {
  return playerId === 1 ? PLAYER_THEMES.player1 : PLAYER_THEMES.player2
}

/**
 * Helper function to calculate food count for game mode
 * @param mode The game mode
 * @returns Number of food items for this mode
 */
export function getFoodCountForMode(mode: GameMode): number {
  switch (mode) {
    case GameMode.COMPETITIVE:
      return MULTIPLAYER_FOOD_CONFIG.COMPETITIVE_FOOD_COUNT
    case GameMode.COOPERATIVE:
      return MULTIPLAYER_FOOD_CONFIG.COOPERATIVE_FOOD_COUNT
    case GameMode.SURVIVAL:
      return MULTIPLAYER_FOOD_CONFIG.COMPETITIVE_FOOD_COUNT
    case GameMode.SINGLE_PLAYER:
      return 1
    default:
      return 1
  }
}
