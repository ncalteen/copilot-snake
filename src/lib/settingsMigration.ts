/**
 * Settings migration system for handling schema evolution
 * Provides versioned migrations and rollback capabilities
 */

import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
  SETTINGS_VERSION,
  GameSettings
} from '@/types/settings'
import { DifficultyLevel } from '@/lib/difficulty'
import { sanitizeSettings, getSettingsVersion } from './settingsValidation'

/**
 * Migration function signature
 */
export type MigrationFunction = (data: unknown) => unknown

/**
 * Migration definition
 */
export interface Migration {
  /** Version this migration targets */
  version: string
  /** Migration function */
  migrate: MigrationFunction
  /** Description of what this migration does */
  description: string
}

/**
 * Migration result
 */
export interface MigrationResult {
  /** Whether migration was successful */
  success: boolean
  /** Migrated settings (if successful) */
  settings?: AppSettings
  /** Error message (if failed) */
  error?: string
  /** List of migrations that were applied */
  migrationsApplied?: string[]
  /** Warnings during migration */
  warnings?: string[]
}

/**
 * Legacy audio settings format (pre-1.0.0)
 */
interface LegacyAudioSettings {
  masterVolume: number
  soundEnabled: boolean
  volumes: {
    food: number
    collision: number
    gameOver: number
    background: number
  }
}

/**
 * Migration from no version (legacy) to 1.0.0
 * Handles settings data that doesn't have a version field
 */
function migrateLegacyTo100(data: unknown): unknown {
  // Handle completely unstructured data
  if (!data || typeof data !== 'object') {
    return DEFAULT_APP_SETTINGS
  }

  const legacyData = data as Record<string, unknown>
  const migrated: Partial<AppSettings> = {
    version: '1.0.0',
    lastUpdated: Date.now()
  }

  // Migrate theme settings (if they exist as separate fields)
  if ('themeMode' in legacyData || 'theme' in legacyData) {
    const themeMode = legacyData.themeMode || legacyData.theme
    migrated.theme = {
      mode:
        typeof themeMode === 'string' &&
        ['light', 'dark', 'system'].includes(themeMode)
          ? (themeMode as 'light' | 'dark' | 'system')
          : 'system',
      reduceMotion: false,
      highContrast: false
    }
  }

  // Migrate audio settings (existing format)
  if ('audio' in legacyData && typeof legacyData.audio === 'object') {
    const audioData = legacyData.audio as LegacyAudioSettings
    migrated.audio = {
      masterVolume:
        typeof audioData.masterVolume === 'number'
          ? audioData.masterVolume
          : 0.7,
      soundEnabled:
        typeof audioData.soundEnabled === 'boolean'
          ? audioData.soundEnabled
          : true,
      volumes: {
        food: audioData.volumes?.food ?? 0.8,
        collision: audioData.volumes?.collision ?? 0.9,
        gameOver: audioData.volumes?.gameOver ?? 0.8,
        background: audioData.volumes?.background ?? 0.3
      },
      notifications: true // New field
    }
  }

  // Migrate game settings (if they exist as separate fields)
  const gameSettings: Partial<GameSettings> = {}

  if ('difficulty' in legacyData && typeof legacyData.difficulty === 'string') {
    const difficultyMap: Record<string, DifficultyLevel> = {
      EASY: DifficultyLevel.EASY,
      MEDIUM: DifficultyLevel.MEDIUM,
      HARD: DifficultyLevel.HARD,
      beginner: DifficultyLevel.BEGINNER,
      easy: DifficultyLevel.EASY,
      medium: DifficultyLevel.MEDIUM,
      hard: DifficultyLevel.HARD,
      expert: DifficultyLevel.EXPERT,
      master: DifficultyLevel.MASTER
    }
    gameSettings.difficulty =
      difficultyMap[legacyData.difficulty] || DifficultyLevel.MEDIUM
  }

  if ('boardWidth' in legacyData && 'boardHeight' in legacyData) {
    gameSettings.boardSize = {
      width:
        typeof legacyData.boardWidth === 'number' ? legacyData.boardWidth : 20,
      height:
        typeof legacyData.boardHeight === 'number' ? legacyData.boardHeight : 20
    }
  }

  migrated.game = {
    difficulty:
      (gameSettings.difficulty as DifficultyLevel) || DifficultyLevel.MEDIUM,
    boardSize: gameSettings.boardSize || { width: 20, height: 20 },
    autoPause: true,
    showPerformanceMetrics: false,
    debugMode: false
  }

  // Set default values for new sections
  migrated.ui = {
    showKeyboardShortcuts: true,
    showGameStatistics: true,
    animationSpeed: 1.0,
    showTooltips: true,
    compactMode: false,
    language: 'en'
  }

  migrated.accessibility = {
    highContrast: false,
    reduceMotion: false,
    enhancedFocus: false,
    screenReaderAnnouncements: true,
    keyboardOnly: false,
    zoomLevel: 1.0,
    enablePanning: false
  }

  migrated.developer = {
    debugMode: false,
    showPerformanceMetrics: false,
    enableLogging: false,
    showComponentBoundaries: false
  }

  return migrated
}

/**
 * Example migration for future version 1.1.0
 * This is a template for how future migrations should be structured
 */
/* 
function migrate100To110(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data
  }

  const settings = data as AppSettings
  
  // Example: Add new field to UI settings
  const migrated = {
    ...settings,
    version: '1.1.0',
    lastUpdated: Date.now(),
    ui: {
      ...settings.ui,
      // Example new field:
      // newFeature: true
    }
  }

  return migrated
}
*/

/**
 * Registry of all available migrations
 * Migrations should be ordered from oldest to newest
 */
export const MIGRATIONS: Migration[] = [
  {
    version: '1.0.0',
    migrate: migrateLegacyTo100,
    description: 'Migrate legacy settings format to structured 1.0.0 format'
  }
  // Future migrations would be added here:
  // {
  //   version: '1.1.0',
  //   migrate: migrate100To110,
  //   description: 'Add new UI features to settings'
  // }
]

/**
 * Applies migrations to bring settings data up to current version
 */
export function migrateSettings(data: unknown): MigrationResult {
  try {
    let currentData = data
    const migrationsApplied: string[] = []
    const warnings: string[] = []

    // Get current version of the data
    const currentVersion = getSettingsVersion(currentData)

    // If there's no version, it's legacy format
    if (!currentVersion) {
      migrationsApplied.push('legacy → 1.0.0')
      currentData = migrateLegacyTo100(currentData)
    }

    // Apply sequential migrations
    for (const migration of MIGRATIONS) {
      const dataVersion = getSettingsVersion(currentData)

      // Skip if we're already at or past this migration version
      if (dataVersion && compareVersions(dataVersion, migration.version) >= 0) {
        continue
      }

      try {
        currentData = migration.migrate(currentData)
        migrationsApplied.push(
          `${dataVersion || 'unknown'} → ${migration.version}`
        )
      } catch (error) {
        warnings.push(`Migration to ${migration.version} had issues: ${error}`)
      }
    }

    // Sanitize the final result to ensure it's valid
    const finalSettings = sanitizeSettings(currentData)

    return {
      success: true,
      settings: finalSettings,
      migrationsApplied,
      warnings
    }
  } catch (error) {
    return {
      success: false,
      error: `Migration failed: ${error}`,
      migrationsApplied: [],
      warnings: []
    }
  }
}

/**
 * Checks if settings data needs migration
 */
export function needsMigration(data: unknown): boolean {
  const version = getSettingsVersion(data)

  if (!version) {
    return true // No version means legacy format
  }

  return compareVersions(version, SETTINGS_VERSION) < 0
}

/**
 * Gets list of migrations that would be applied to the data
 */
export function getMigrationsForData(data: unknown): Migration[] {
  const currentVersion = getSettingsVersion(data)

  if (!currentVersion) {
    // Return all migrations for legacy data
    return MIGRATIONS
  }

  // Return migrations that would be applied
  return MIGRATIONS.filter(
    (migration) => compareVersions(currentVersion, migration.version) < 0
  )
}

/**
 * Creates a backup of settings before migration
 */
export function createSettingsBackup(settings: AppSettings): string {
  try {
    const backup = {
      backedUpAt: Date.now(),
      originalVersion: settings.version,
      settings: settings
    }

    return JSON.stringify(backup, null, 2)
  } catch {
    throw new Error('Failed to create settings backup')
  }
}

/**
 * Restores settings from a backup
 */
export function restoreFromBackup(backupData: string): MigrationResult {
  try {
    const backup = JSON.parse(backupData)

    if (!backup.settings) {
      return {
        success: false,
        error: 'Invalid backup format: missing settings'
      }
    }

    // The restored settings might need migration if they're from an older version
    return migrateSettings(backup.settings)
  } catch (error) {
    return {
      success: false,
      error: `Failed to restore from backup: ${error}`
    }
  }
}

/**
 * Compares two semantic version strings
 * Returns: -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)

  const maxLength = Math.max(parts1.length, parts2.length)

  for (let i = 0; i < maxLength; i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0

    if (part1 < part2) return -1
    if (part1 > part2) return 1
  }

  return 0
}

/**
 * Validates that migration was successful
 */
export function validateMigration(
  originalData: unknown,
  migratedSettings: AppSettings
): boolean {
  try {
    // Basic sanity checks
    if (!migratedSettings.version || !migratedSettings.lastUpdated) {
      return false
    }

    // Check that all required sections exist
    const requiredSections = [
      'theme',
      'audio',
      'game',
      'ui',
      'accessibility',
      'developer'
    ]
    for (const section of requiredSections) {
      if (!(section in migratedSettings)) {
        return false
      }
    }

    // Version should be current or newer
    if (compareVersions(migratedSettings.version, SETTINGS_VERSION) < 0) {
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Gets information about the current migration system
 */
export function getMigrationInfo() {
  return {
    currentVersion: SETTINGS_VERSION,
    availableMigrations: MIGRATIONS.map((m) => ({
      version: m.version,
      description: m.description
    })),
    migrationCount: MIGRATIONS.length
  }
}
