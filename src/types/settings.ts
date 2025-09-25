/**
 * Comprehensive settings type definitions and Zod validation schemas
 * Centralizes all application settings with type safety and runtime validation
 */

import { z } from 'zod'
import { ThemeMode } from '@/lib/theme'
import { DifficultyLevel } from '@/lib/difficulty'

/**
 * Settings schema version for migration purposes
 */
export const SETTINGS_VERSION = '1.0.0'

/**
 * Theme settings interface
 */
export interface ThemeSettings {
  /** Current theme mode */
  mode: ThemeMode
  /** Custom theme name if using custom theme */
  customTheme?: string
  /** Reduce motion for accessibility */
  reduceMotion: boolean
  /** High contrast mode */
  highContrast: boolean
}

/**
 * Audio settings interface (extends existing AudioSettings)
 */
export interface AudioSettings {
  /** Master volume (0-1) */
  masterVolume: number
  /** Sound effects enabled */
  soundEnabled: boolean
  /** Individual sound volumes */
  volumes: {
    food: number
    collision: number
    gameOver: number
    background: number
  }
  /** Audio notifications enabled */
  notifications: boolean
}

/**
 * Game settings interface
 */
export interface GameSettings {
  /** Difficulty level */
  difficulty: DifficultyLevel
  /** Custom speed override (milliseconds per move) */
  customSpeed?: number
  /** Board dimensions */
  boardSize: {
    width: number
    height: number
  }
  /** Auto-pause when window loses focus */
  autoPause: boolean
  /** Show performance metrics (FPS, etc.) */
  showPerformanceMetrics: boolean
  /** Enable collision detection debug mode */
  debugMode: boolean
}

/**
 * UI settings interface
 */
export interface UISettings {
  /** Show keyboard shortcuts overlay */
  showKeyboardShortcuts: boolean
  /** Show game statistics */
  showGameStatistics: boolean
  /** Animation duration multiplier (0.1-2.0) */
  animationSpeed: number
  /** Show tooltips */
  showTooltips: boolean
  /** Compact mode for smaller screens */
  compactMode: boolean
  /** Language preference */
  language: string
}

/**
 * Accessibility settings interface
 */
export interface AccessibilitySettings {
  /** High contrast mode */
  highContrast: boolean
  /** Reduce motion for vestibular disorders */
  reduceMotion: boolean
  /** Focus ring visibility */
  enhancedFocus: boolean
  /** Screen reader announcements */
  screenReaderAnnouncements: boolean
  /** Keyboard navigation only */
  keyboardOnly: boolean
}

/**
 * Developer settings interface
 */
export interface DeveloperSettings {
  /** Enable debug mode */
  debugMode: boolean
  /** Show performance metrics */
  showPerformanceMetrics: boolean
  /** Enable console logging */
  enableLogging: boolean
  /** Show component boundaries */
  showComponentBoundaries: boolean
}

/**
 * Complete application settings interface
 */
export interface AppSettings {
  /** Settings schema version */
  version: string
  /** Timestamp of last update */
  lastUpdated: number
  /** Theme settings */
  theme: ThemeSettings
  /** Audio settings */
  audio: AudioSettings
  /** Game settings */
  game: GameSettings
  /** UI settings */
  ui: UISettings
  /** Accessibility settings */
  accessibility: AccessibilitySettings
  /** Developer settings */
  developer: DeveloperSettings
}

/**
 * Zod schema for ThemeMode validation
 */
export const ThemeModeSchema = z.union([
  z.literal('light'),
  z.literal('dark'),
  z.literal('system')
]) as z.ZodSchema<ThemeMode>

/**
 * Zod schema for DifficultyLevel validation
 */
export const DifficultyLevelSchema = z.nativeEnum(DifficultyLevel)

/**
 * Zod schema for theme settings
 */
export const ThemeSettingsSchema = z.object({
  mode: ThemeModeSchema,
  customTheme: z.string().optional(),
  reduceMotion: z.boolean(),
  highContrast: z.boolean()
})

/**
 * Zod schema for audio settings
 */
export const AudioSettingsSchema = z.object({
  masterVolume: z.number().min(0).max(1),
  soundEnabled: z.boolean(),
  volumes: z.object({
    food: z.number().min(0).max(1),
    collision: z.number().min(0).max(1),
    gameOver: z.number().min(0).max(1),
    background: z.number().min(0).max(1)
  }),
  notifications: z.boolean()
})

/**
 * Zod schema for game settings
 */
export const GameSettingsSchema = z.object({
  difficulty: DifficultyLevelSchema,
  customSpeed: z.number().min(25).max(1000).optional(),
  boardSize: z.object({
    width: z.number().min(10).max(50),
    height: z.number().min(10).max(50)
  }),
  autoPause: z.boolean(),
  showPerformanceMetrics: z.boolean(),
  debugMode: z.boolean()
})

/**
 * Zod schema for UI settings
 */
export const UISettingsSchema = z.object({
  showKeyboardShortcuts: z.boolean(),
  showGameStatistics: z.boolean(),
  animationSpeed: z.number().min(0.1).max(2.0),
  showTooltips: z.boolean(),
  compactMode: z.boolean(),
  language: z.string().min(2).max(5)
})

/**
 * Zod schema for accessibility settings
 */
export const AccessibilitySettingsSchema = z.object({
  highContrast: z.boolean(),
  reduceMotion: z.boolean(),
  enhancedFocus: z.boolean(),
  screenReaderAnnouncements: z.boolean(),
  keyboardOnly: z.boolean()
})

/**
 * Zod schema for developer settings
 */
export const DeveloperSettingsSchema = z.object({
  debugMode: z.boolean(),
  showPerformanceMetrics: z.boolean(),
  enableLogging: z.boolean(),
  showComponentBoundaries: z.boolean()
})

/**
 * Complete app settings Zod schema
 */
export const AppSettingsSchema = z.object({
  version: z.string(),
  lastUpdated: z.number(),
  theme: ThemeSettingsSchema,
  audio: AudioSettingsSchema,
  game: GameSettingsSchema,
  ui: UISettingsSchema,
  accessibility: AccessibilitySettingsSchema,
  developer: DeveloperSettingsSchema
})

/**
 * Default theme settings
 */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: 'system',
  reduceMotion: false,
  highContrast: false
}

/**
 * Default audio settings
 */
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  soundEnabled: true,
  volumes: {
    food: 0.8,
    collision: 0.9,
    gameOver: 0.8,
    background: 0.3
  },
  notifications: true
}

/**
 * Default game settings
 */
export const DEFAULT_GAME_SETTINGS: GameSettings = {
  difficulty: DifficultyLevel.MEDIUM,
  boardSize: {
    width: 20,
    height: 20
  },
  autoPause: true,
  showPerformanceMetrics: false,
  debugMode: false
}

/**
 * Default UI settings
 */
export const DEFAULT_UI_SETTINGS: UISettings = {
  showKeyboardShortcuts: true,
  showGameStatistics: true,
  animationSpeed: 1.0,
  showTooltips: true,
  compactMode: false,
  language: 'en'
}

/**
 * Default accessibility settings
 */
export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  reduceMotion: false,
  enhancedFocus: false,
  screenReaderAnnouncements: true,
  keyboardOnly: false
}

/**
 * Default developer settings
 */
export const DEFAULT_DEVELOPER_SETTINGS: DeveloperSettings = {
  debugMode: false,
  showPerformanceMetrics: false,
  enableLogging: false,
  showComponentBoundaries: false
}

/**
 * Complete default application settings
 */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  version: SETTINGS_VERSION,
  lastUpdated: Date.now(),
  theme: DEFAULT_THEME_SETTINGS,
  audio: DEFAULT_AUDIO_SETTINGS,
  game: DEFAULT_GAME_SETTINGS,
  ui: DEFAULT_UI_SETTINGS,
  accessibility: DEFAULT_ACCESSIBILITY_SETTINGS,
  developer: DEFAULT_DEVELOPER_SETTINGS
}

/**
 * Partial settings type for updates
 */
export type PartialAppSettings = Partial<{
  theme: Partial<ThemeSettings>
  audio: Partial<AudioSettings>
  game: Partial<GameSettings>
  ui: Partial<UISettings>
  accessibility: Partial<AccessibilitySettings>
  developer: Partial<DeveloperSettings>
}>

/**
 * Settings export format with metadata
 */
export interface SettingsExport {
  /** Export timestamp */
  exportedAt: number
  /** Application version */
  appVersion: string
  /** Settings version */
  settingsVersion: string
  /** Exported settings data */
  settings: AppSettings
  /** Optional export metadata */
  metadata?: {
    exportedBy?: string
    description?: string
    tags?: string[]
  }
}

/**
 * Settings import result
 */
export interface SettingsImportResult {
  /** Whether import was successful */
  success: boolean
  /** Imported settings (if successful) */
  settings?: AppSettings
  /** Error message (if failed) */
  error?: string
  /** Warnings during import */
  warnings?: string[]
  /** Settings that were migrated */
  migrated?: boolean
}

/**
 * Settings validation result
 */
export interface SettingsValidationResult {
  /** Whether validation passed */
  valid: boolean
  /** Validated settings (if valid) */
  settings?: AppSettings
  /** Validation errors */
  errors?: string[]
  /** Validation warnings */
  warnings?: string[]
}
