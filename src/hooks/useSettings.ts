'use client'

/**
 * Comprehensive settings management hook with localStorage persistence
 * Provides CRUD operations, validation, and synchronization across components
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  AppSettings,
  PartialAppSettings,
  DEFAULT_APP_SETTINGS,
  SETTINGS_VERSION
} from '@/types/settings'
import {
  validateAppSettings,
  sanitizeSettings,
  mergeSettings,
  validateSettingValue
} from '@/lib/settingsValidation'
import { migrateSettings, needsMigration } from '@/lib/settingsMigration'
import { importSettings, exportSettings } from '@/lib/settingsIO'

/**
 * Settings hook return type
 */
interface UseSettingsReturn {
  /** Current settings */
  settings: AppSettings
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: string | null
  /** Update partial settings */
  updateSettings: (updates: PartialAppSettings) => Promise<boolean>
  /** Reset all settings to defaults */
  resetSettings: () => Promise<boolean>
  /** Reset specific settings section */
  resetSection: (
    section: keyof Omit<AppSettings, 'version' | 'lastUpdated'>
  ) => Promise<boolean>
  /** Update a single setting value */
  updateSetting: (path: string, value: unknown) => Promise<boolean>
  /** Get a specific setting value */
  getSetting: (path: string) => unknown
  /** Export current settings */
  exportSettings: () => string
  /** Import settings from JSON */
  importSettings: (data: string) => Promise<boolean>
  /** Clear error state */
  clearError: () => void
  /** Force reload from localStorage */
  reload: () => Promise<void>
  /** Check if settings have been modified */
  isDirty: boolean
  /** Save pending changes */
  save: () => Promise<boolean>
}

/**
 * Local storage key for settings
 */
const SETTINGS_STORAGE_KEY = 'snake-game-settings'

/**
 * Settings change event for cross-tab synchronization
 */
const SETTINGS_CHANGE_EVENT = 'snake-settings-changed'

/**
 * Load settings from localStorage with migration and validation
 */
function loadSettingsFromStorage(): AppSettings {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_APP_SETTINGS, lastUpdated: Date.now() }
  }

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)

    if (!stored) {
      return { ...DEFAULT_APP_SETTINGS, lastUpdated: Date.now() }
    }

    const parsed = JSON.parse(stored)

    // Check if migration is needed
    if (needsMigration(parsed)) {
      const migrationResult = migrateSettings(parsed)

      if (migrationResult.success && migrationResult.settings) {
        // Save migrated settings
        saveSettingsToStorage(migrationResult.settings)
        return migrationResult.settings
      } else {
        console.warn(
          'Settings migration failed, using defaults:',
          migrationResult.error
        )
        return { ...DEFAULT_APP_SETTINGS, lastUpdated: Date.now() }
      }
    }

    // Validate settings
    const validationResult = validateAppSettings(parsed)

    if (validationResult.valid && validationResult.settings) {
      return validationResult.settings
    } else {
      // Try to sanitize
      console.warn(
        'Settings validation failed, attempting to sanitize:',
        validationResult.errors
      )
      return sanitizeSettings(parsed)
    }
  } catch (error) {
    console.warn('Failed to load settings from localStorage:', error)
    return { ...DEFAULT_APP_SETTINGS, lastUpdated: Date.now() }
  }
}

/**
 * Save settings to localStorage
 */
function saveSettingsToStorage(settings: AppSettings): boolean {
  if (typeof window === 'undefined') return false

  try {
    const settingsToSave = {
      ...settings,
      version: SETTINGS_VERSION,
      lastUpdated: Date.now()
    }

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settingsToSave))

    // Dispatch custom event for cross-tab synchronization
    window.dispatchEvent(
      new CustomEvent(SETTINGS_CHANGE_EVENT, {
        detail: settingsToSave
      })
    )

    return true
  } catch (error) {
    console.warn('Failed to save settings to localStorage:', error)
    return false
  }
}

/**
 * Get nested setting value by path
 */
function getNestedValue(obj: unknown, path: string): unknown {
  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return undefined
    }
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

/**
 * Set nested setting value by path
 */
function setNestedValue(
  obj: AppSettings,
  path: string,
  value: unknown
): AppSettings {
  const keys = path.split('.')
  const result = { ...obj }
  let current: Record<string, unknown> = result as Record<string, unknown>

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    } else {
      current[key] = { ...current[key] }
    }
    current = current[key] as Record<string, unknown>
  }

  current[keys[keys.length - 1]] = value
  return result
}

/**
 * Custom hook for comprehensive settings management
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadSettingsFromStorage()
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Keep track of original settings for dirty checking
  const originalSettingsRef = useRef<AppSettings>(settings)
  const pendingChangesRef = useRef<PartialAppSettings>({})

  /**
   * Update settings with validation and persistence
   */
  const updateSettings = useCallback(
    async (updates: PartialAppSettings): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        // Merge with current settings
        const mergeResult = mergeSettings(settings, updates)

        if (!mergeResult.valid) {
          setError(
            mergeResult.errors?.join(', ') || 'Settings validation failed'
          )
          return false
        }

        const newSettings = mergeResult.settings!

        // Save to localStorage
        const saveSuccess = saveSettingsToStorage(newSettings)

        if (!saveSuccess) {
          setError('Failed to save settings')
          return false
        }

        // Update state
        setSettings(newSettings)
        originalSettingsRef.current = newSettings
        pendingChangesRef.current = {}
        setIsDirty(false)

        if (mergeResult.warnings && mergeResult.warnings.length > 0) {
          console.warn('Settings update warnings:', mergeResult.warnings)
        }

        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error occurred'
        setError(errorMessage)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [settings]
  )

  /**
   * Reset all settings to defaults
   */
  const resetSettings = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const defaultSettings = {
        ...DEFAULT_APP_SETTINGS,
        lastUpdated: Date.now()
      }
      const saveSuccess = saveSettingsToStorage(defaultSettings)

      if (!saveSuccess) {
        setError('Failed to reset settings')
        return false
      }

      setSettings(defaultSettings)
      originalSettingsRef.current = defaultSettings
      pendingChangesRef.current = {}
      setIsDirty(false)

      return true
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reset settings'
      setError(errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Reset specific settings section
   */
  const resetSection = useCallback(
    async (
      section: keyof Omit<AppSettings, 'version' | 'lastUpdated'>
    ): Promise<boolean> => {
      const updates: PartialAppSettings = {
        [section]: DEFAULT_APP_SETTINGS[section]
      }
      return updateSettings(updates)
    },
    [updateSettings]
  )

  /**
   * Update a single setting value by path
   */
  const updateSetting = useCallback(
    async (path: string, value: unknown): Promise<boolean> => {
      setError(null)

      // Validate the setting value
      const validation = validateSettingValue(path, value)
      if (!validation.valid) {
        setError(validation.error || 'Invalid setting value')
        return false
      }

      try {
        const newSettings = setNestedValue(settings, path, value)

        // Mark as dirty for batch updates
        setIsDirty(true)
        setSettings(newSettings)

        // Store pending change
        const pathParts = path.split('.')
        if (pathParts.length >= 2) {
          const section = pathParts[0] as keyof PartialAppSettings
          const nestedPath = pathParts.slice(1).join('.')

          if (!pendingChangesRef.current[section]) {
            pendingChangesRef.current[section] = {} as Record<string, unknown>
          }

          // For simplicity, we'll save immediately for individual setting updates
          // In a more complex implementation, you might want to batch these
          return updateSettings({
            [section]: { [nestedPath]: value }
          } as PartialAppSettings)
        }

        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update setting'
        setError(errorMessage)
        return false
      }
    },
    [settings, updateSettings]
  )

  /**
   * Get a specific setting value by path
   */
  const getSetting = useCallback(
    (path: string): unknown => {
      return getNestedValue(settings, path)
    },
    [settings]
  )

  /**
   * Export current settings as JSON string
   */
  const exportSettingsData = useCallback((): string => {
    try {
      const exportData = exportSettings(settings, {
        exportedBy: 'Snake Game Settings',
        description: 'User settings export'
      })
      return JSON.stringify(exportData, null, 2)
    } catch {
      throw new Error(`Failed to export settings: ${error}`)
    }
  }, [settings])

  /**
   * Import settings from JSON string
   */
  const importSettingsData = useCallback(
    async (data: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)

      try {
        const parsed = JSON.parse(data)
        const importResult = importSettings(parsed)

        if (!importResult.success) {
          setError(importResult.error || 'Import failed')
          return false
        }

        if (!importResult.settings) {
          setError('No settings data in import')
          return false
        }

        // Save imported settings
        const saveSuccess = saveSettingsToStorage(importResult.settings)

        if (!saveSuccess) {
          setError('Failed to save imported settings')
          return false
        }

        setSettings(importResult.settings)
        originalSettingsRef.current = importResult.settings
        pendingChangesRef.current = {}
        setIsDirty(false)

        if (importResult.warnings && importResult.warnings.length > 0) {
          console.warn('Import warnings:', importResult.warnings)
        }

        return true
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to import settings'
        setError(errorMessage)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Force reload settings from localStorage
   */
  const reload = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const freshSettings = loadSettingsFromStorage()
      setSettings(freshSettings)
      originalSettingsRef.current = freshSettings
      pendingChangesRef.current = {}
      setIsDirty(false)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to reload settings'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Save pending changes
   */
  const save = useCallback(async (): Promise<boolean> => {
    if (!isDirty) return true

    const saveSuccess = saveSettingsToStorage(settings)

    if (saveSuccess) {
      originalSettingsRef.current = settings
      pendingChangesRef.current = {}
      setIsDirty(false)
    } else {
      setError('Failed to save settings')
    }

    return saveSuccess
  }, [settings, isDirty])

  /**
   * Listen for cross-tab settings changes
   */
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === SETTINGS_STORAGE_KEY && event.newValue) {
        try {
          const newSettings = JSON.parse(event.newValue)
          const validationResult = validateAppSettings(newSettings)

          if (validationResult.valid && validationResult.settings) {
            setSettings(validationResult.settings)
            originalSettingsRef.current = validationResult.settings
            setIsDirty(false)
          }
        } catch {
          console.warn('Failed to sync settings from other tab:', error)
        }
      }
    }

    const handleCustomEvent = (event: CustomEvent) => {
      setSettings(event.detail)
      originalSettingsRef.current = event.detail
      setIsDirty(false)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(
      SETTINGS_CHANGE_EVENT,
      handleCustomEvent as EventListener
    )

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(
        SETTINGS_CHANGE_EVENT,
        handleCustomEvent as EventListener
      )
    }
  }, [])

  /**
   * Auto-save settings when component unmounts
   */
  useEffect(() => {
    return () => {
      if (isDirty) {
        saveSettingsToStorage(settings)
      }
    }
  }, [settings, isDirty])

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetSettings,
    resetSection,
    updateSetting,
    getSetting,
    exportSettings: exportSettingsData,
    importSettings: importSettingsData,
    clearError,
    reload,
    isDirty,
    save
  }
}
