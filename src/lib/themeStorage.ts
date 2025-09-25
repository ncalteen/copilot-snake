/**
 * Theme persistence utilities for localStorage operations
 * Handles theme settings storage with error handling and fallbacks
 */

import { ThemeMode } from './theme'

const THEME_STORAGE_KEY = 'snake-game-theme'
const STORAGE_VERSION = '1.0'

export interface ThemeStorageData {
  mode: ThemeMode
  version: string
  timestamp: number
}

/**
 * Save theme preference to localStorage
 */
export function saveThemePreference(mode: ThemeMode): boolean {
  try {
    if (typeof window === 'undefined') return false

    const data: ThemeStorageData = {
      mode,
      version: STORAGE_VERSION,
      timestamp: Date.now()
    }

    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.warn('Failed to save theme preference:', error)
    return false
  }
}

/**
 * Load theme preference from localStorage
 */
export function loadThemePreference(): ThemeMode | null {
  try {
    if (typeof window === 'undefined') return null

    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    if (!stored) return null

    const data = JSON.parse(stored) as ThemeStorageData

    // Validate stored data structure
    if (!data || typeof data !== 'object') return null
    if (!data.mode || !['light', 'dark', 'system'].includes(data.mode))
      return null
    if (!data.version || !data.timestamp) return null

    // For now, we accept all versions, but in the future we could add migration logic
    return data.mode
  } catch (error) {
    console.warn('Failed to load theme preference:', error)
    return null
  }
}

/**
 * Clear theme preference from localStorage
 */
export function clearThemePreference(): boolean {
  try {
    if (typeof window === 'undefined') return false

    localStorage.removeItem(THEME_STORAGE_KEY)
    return true
  } catch (error) {
    console.warn('Failed to clear theme preference:', error)
    return false
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined') return false

    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

/**
 * Get default theme mode with fallback logic
 */
export function getDefaultTheme(): ThemeMode {
  // Try to load from storage first
  const stored = loadThemePreference()
  if (stored) return stored

  // Fallback to system preference if storage is not available
  return 'system'
}

/**
 * Migrate theme data from older versions (future-proofing)
 */
export function migrateThemeData(data: unknown): ThemeStorageData | null {
  try {
    // Handle legacy format (simple string)
    if (
      typeof data === 'string' &&
      ['light', 'dark', 'system'].includes(data)
    ) {
      return {
        mode: data as ThemeMode,
        version: STORAGE_VERSION,
        timestamp: Date.now()
      }
    }

    // Handle current format
    if (
      data &&
      typeof data === 'object' &&
      'mode' in data &&
      data.mode &&
      ['light', 'dark', 'system'].includes(data.mode as string)
    ) {
      const objData = data as { mode: ThemeMode; timestamp?: number }
      return {
        mode: objData.mode,
        version: STORAGE_VERSION,
        timestamp: objData.timestamp || Date.now()
      }
    }

    return null
  } catch {
    return null
  }
}
