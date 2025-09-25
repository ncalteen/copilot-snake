/**
 * Settings validation utilities using Zod schemas
 * Provides type-safe validation, sanitization, and error handling
 */

import { z } from 'zod'
import {
  AppSettings,
  AppSettingsSchema,
  PartialAppSettings,
  ThemeSettingsSchema,
  AudioSettingsSchema,
  GameSettingsSchema,
  UISettingsSchema,
  AccessibilitySettingsSchema,
  DeveloperSettingsSchema,
  DEFAULT_APP_SETTINGS,
  SettingsValidationResult,
  SETTINGS_VERSION
} from '@/types/settings'

/**
 * Validates complete application settings
 */
export function validateAppSettings(data: unknown): SettingsValidationResult {
  try {
    const validatedSettings = AppSettingsSchema.parse(data)
    return {
      valid: true,
      settings: validatedSettings,
      warnings: []
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err) => {
        const path = err.path.join('.')
        return `${path}: ${err.message}`
      })

      return {
        valid: false,
        errors,
        warnings: []
      }
    }

    return {
      valid: false,
      errors: ['Unknown validation error occurred'],
      warnings: []
    }
  }
}

/**
 * Validates partial settings updates
 */
export function validatePartialSettings(
  data: unknown
): SettingsValidationResult {
  try {
    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        errors: ['Settings data must be an object'],
        warnings: []
      }
    }

    const updateData = data as Record<string, unknown>
    const validatedSettings = { ...DEFAULT_APP_SETTINGS }
    const warnings: string[] = []

    // Validate each section if present
    if (updateData.theme) {
      try {
        const themeResult = ThemeSettingsSchema.parse(updateData.theme)
        validatedSettings.theme = { ...validatedSettings.theme, ...themeResult }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const themeErrors = error.issues.map(
            (err) => `theme.${err.path.join('.')}: ${err.message}`
          )
          return { valid: false, errors: themeErrors, warnings }
        }
      }
    }

    if (updateData.audio) {
      try {
        const audioResult = AudioSettingsSchema.parse(updateData.audio)
        validatedSettings.audio = { ...validatedSettings.audio, ...audioResult }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const audioErrors = error.issues.map(
            (err) => `audio.${err.path.join('.')}: ${err.message}`
          )
          return { valid: false, errors: audioErrors, warnings }
        }
      }
    }

    if (updateData.game) {
      try {
        const gameResult = GameSettingsSchema.parse(updateData.game)
        validatedSettings.game = { ...validatedSettings.game, ...gameResult }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const gameErrors = error.issues.map(
            (err) => `game.${err.path.join('.')}: ${err.message}`
          )
          return { valid: false, errors: gameErrors, warnings }
        }
      }
    }

    if (updateData.ui) {
      try {
        const uiResult = UISettingsSchema.parse(updateData.ui)
        validatedSettings.ui = { ...validatedSettings.ui, ...uiResult }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const uiErrors = error.issues.map(
            (err) => `ui.${err.path.join('.')}: ${err.message}`
          )
          return { valid: false, errors: uiErrors, warnings }
        }
      }
    }

    if (updateData.accessibility) {
      try {
        const accessibilityResult = AccessibilitySettingsSchema.parse(
          updateData.accessibility
        )
        validatedSettings.accessibility = {
          ...validatedSettings.accessibility,
          ...accessibilityResult
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const accessibilityErrors = error.issues.map(
            (err) => `accessibility.${err.path.join('.')}: ${err.message}`
          )
          return { valid: false, errors: accessibilityErrors, warnings }
        }
      }
    }

    if (updateData.developer) {
      try {
        const developerResult = DeveloperSettingsSchema.parse(
          updateData.developer
        )
        validatedSettings.developer = {
          ...validatedSettings.developer,
          ...developerResult
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          const developerErrors = error.issues.map(
            (err) => `developer.${err.path.join('.')}: ${err.message}`
          )
          return { valid: false, errors: developerErrors, warnings }
        }
      }
    }

    // Update version and timestamp
    validatedSettings.version = SETTINGS_VERSION
    validatedSettings.lastUpdated = Date.now()

    return {
      valid: true,
      settings: validatedSettings,
      warnings
    }
  } catch {
    return {
      valid: false,
      errors: ['Failed to validate partial settings'],
      warnings: []
    }
  }
}

/**
 * Sanitizes settings data by removing unknown properties and applying defaults
 */
export function sanitizeSettings(data: unknown): AppSettings {
  // First try to validate the data as-is
  const validationResult = validateAppSettings(data)

  if (validationResult.valid && validationResult.settings) {
    return validationResult.settings
  }

  // If validation fails, try to salvage what we can
  if (!data || typeof data !== 'object') {
    return { ...DEFAULT_APP_SETTINGS, lastUpdated: Date.now() }
  }

  const inputData = data as Record<string, unknown>
  const sanitized = { ...DEFAULT_APP_SETTINGS }

  // Try to salvage individual sections
  try {
    if (inputData.theme && typeof inputData.theme === 'object') {
      const themeResult = ThemeSettingsSchema.safeParse(inputData.theme)
      if (themeResult.success) {
        sanitized.theme = { ...sanitized.theme, ...themeResult.data }
      }
    }

    if (inputData.audio && typeof inputData.audio === 'object') {
      const audioResult = AudioSettingsSchema.safeParse(inputData.audio)
      if (audioResult.success) {
        sanitized.audio = { ...sanitized.audio, ...audioResult.data }
      }
    }

    if (inputData.game && typeof inputData.game === 'object') {
      const gameResult = GameSettingsSchema.safeParse(inputData.game)
      if (gameResult.success) {
        sanitized.game = { ...sanitized.game, ...gameResult.data }
      }
    }

    if (inputData.ui && typeof inputData.ui === 'object') {
      const uiResult = UISettingsSchema.safeParse(inputData.ui)
      if (uiResult.success) {
        sanitized.ui = { ...sanitized.ui, ...uiResult.data }
      }
    }

    if (
      inputData.accessibility &&
      typeof inputData.accessibility === 'object'
    ) {
      const accessibilityResult = AccessibilitySettingsSchema.safeParse(
        inputData.accessibility
      )
      if (accessibilityResult.success) {
        sanitized.accessibility = {
          ...sanitized.accessibility,
          ...accessibilityResult.data
        }
      }
    }

    if (inputData.developer && typeof inputData.developer === 'object') {
      const developerResult = DeveloperSettingsSchema.safeParse(
        inputData.developer
      )
      if (developerResult.success) {
        sanitized.developer = {
          ...sanitized.developer,
          ...developerResult.data
        }
      }
    }
  } catch (error) {
    console.warn('Error during settings sanitization:', error)
  }

  // Update metadata
  sanitized.version = SETTINGS_VERSION
  sanitized.lastUpdated = Date.now()

  return sanitized
}

/**
 * Validates and merges partial settings with existing settings
 */
export function mergeSettings(
  existingSettings: AppSettings,
  updates: PartialAppSettings
): SettingsValidationResult {
  try {
    // Create a merged settings object
    const mergedSettings: AppSettings = {
      ...existingSettings,
      version: SETTINGS_VERSION,
      lastUpdated: Date.now()
    }

    const warnings: string[] = []

    // Merge each section if provided
    if (updates.theme) {
      try {
        const themeResult = ThemeSettingsSchema.parse({
          ...existingSettings.theme,
          ...updates.theme
        })
        mergedSettings.theme = themeResult
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.issues.map(
            (err) => `theme.${err.path.join('.')}: ${err.message}`
          )
          return { valid: false, errors, warnings }
        }
      }
    }

    if (updates.audio) {
      try {
        const audioResult = AudioSettingsSchema.parse({
          ...existingSettings.audio,
          ...updates.audio,
          volumes: {
            ...existingSettings.audio.volumes,
            ...(updates.audio.volumes || {})
          }
        })
        mergedSettings.audio = audioResult
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.issues.map(
            (err) => `audio.${err.path.join('.')}: ${err.message}`
          )
          return { valid: false, errors, warnings }
        }
      }
    }

    if (updates.game) {
      try {
        const gameResult = GameSettingsSchema.parse({
          ...existingSettings.game,
          ...updates.game,
          boardSize: {
            ...existingSettings.game.boardSize,
            ...(updates.game.boardSize || {})
          }
        })
        mergedSettings.game = gameResult
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.issues.map(
            (err) => `game.${err.path.join('.')}: ${err.message}`
          )
          return { valid: false, errors, warnings }
        }
      }
    }

    if (updates.ui) {
      try {
        const uiResult = UISettingsSchema.parse({
          ...existingSettings.ui,
          ...updates.ui
        })
        mergedSettings.ui = uiResult
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.issues.map(
            (err) => `ui.${err.path.join('.')}: ${err.message}`
          )
          return { valid: false, errors, warnings }
        }
      }
    }

    if (updates.accessibility) {
      try {
        const accessibilityResult = AccessibilitySettingsSchema.parse({
          ...existingSettings.accessibility,
          ...updates.accessibility
        })
        mergedSettings.accessibility = accessibilityResult
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.issues.map(
            (err) => `accessibility.${err.path.join('.')}: ${err.message}`
          )
          return { valid: false, errors, warnings }
        }
      }
    }

    if (updates.developer) {
      try {
        const developerResult = DeveloperSettingsSchema.parse({
          ...existingSettings.developer,
          ...updates.developer
        })
        mergedSettings.developer = developerResult
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.issues.map(
            (err) => `developer.${err.path.join('.')}: ${err.message}`
          )
          return { valid: false, errors, warnings }
        }
      }
    }

    return {
      valid: true,
      settings: mergedSettings,
      warnings
    }
  } catch {
    return {
      valid: false,
      errors: ['Failed to merge settings'],
      warnings: []
    }
  }
}

/**
 * Validates individual setting values with detailed error information
 */
export function validateSettingValue(
  path: string,
  value: unknown
): { valid: boolean; error?: string } {
  try {
    const pathParts = path.split('.')

    if (pathParts.length < 2) {
      return { valid: false, error: 'Invalid setting path' }
    }

    const [section, ...nestedPath] = pathParts

    switch (section) {
      case 'theme':
        return validateNestedValue(ThemeSettingsSchema, nestedPath, value)
      case 'audio':
        return validateNestedValue(AudioSettingsSchema, nestedPath, value)
      case 'game':
        return validateNestedValue(GameSettingsSchema, nestedPath, value)
      case 'ui':
        return validateNestedValue(UISettingsSchema, nestedPath, value)
      case 'accessibility':
        return validateNestedValue(
          AccessibilitySettingsSchema,
          nestedPath,
          value
        )
      case 'developer':
        return validateNestedValue(DeveloperSettingsSchema, nestedPath, value)
      default:
        return { valid: false, error: `Unknown settings section: ${section}` }
    }
  } catch {
    return { valid: false, error: 'Validation failed' }
  }
}

/**
 * Helper function to validate nested values
 */
function validateNestedValue(
  schema: z.ZodSchema,
  path: string[],
  value: unknown
): { valid: boolean; error?: string } {
  try {
    // For now, we'll create a minimal object to test the value
    // This is a simplified approach - in a production app you might want
    // more sophisticated nested validation
    const testObject: Record<string, unknown> = {}
    let current = testObject

    for (let i = 0; i < path.length - 1; i++) {
      current[path[i]] = {}
      current = current[path[i]] as Record<string, unknown>
    }

    current[path[path.length - 1]] = value

    const result = schema.safeParse(testObject)

    if (result.success) {
      return { valid: true }
    } else {
      const error = result.error.issues[0]
      return { valid: false, error: error.message }
    }
  } catch {
    return { valid: false, error: 'Validation failed' }
  }
}

/**
 * Checks if settings data structure is compatible with current version
 */
export function isSettingsCompatible(data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false
  }

  const settingsData = data as Record<string, unknown>

  // Check for required top-level properties
  const requiredProperties = [
    'theme',
    'audio',
    'game',
    'ui',
    'accessibility',
    'developer'
  ]

  for (const prop of requiredProperties) {
    if (!(prop in settingsData)) {
      return false
    }
  }

  return true
}

/**
 * Gets the version of settings data
 */
export function getSettingsVersion(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null
  }

  const settingsData = data as Record<string, unknown>

  if ('version' in settingsData && typeof settingsData.version === 'string') {
    return settingsData.version
  }

  return null
}

/**
 * Checks if settings data needs migration
 */
export function needsMigration(data: unknown): boolean {
  const version = getSettingsVersion(data)

  if (!version) {
    return true // No version means old format
  }

  return version !== SETTINGS_VERSION
}
