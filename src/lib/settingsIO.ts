/**
 * Settings import/export functionality
 * Handles safe file operations, validation, and user data portability
 */

import {
  AppSettings,
  SettingsExport,
  SettingsImportResult,
  SETTINGS_VERSION
} from '@/types/settings'
import { validateAppSettings, sanitizeSettings } from './settingsValidation'
import { migrateSettings, needsMigration } from './settingsMigration'

/**
 * Export settings to JSON format with metadata
 */
export function exportSettings(
  settings: AppSettings,
  metadata?: {
    exportedBy?: string
    description?: string
    tags?: string[]
  }
): SettingsExport {
  return {
    exportedAt: Date.now(),
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
    settingsVersion: SETTINGS_VERSION,
    settings: { ...settings },
    metadata
  }
}

/**
 * Export settings as downloadable JSON file
 */
export function exportSettingsAsFile(
  settings: AppSettings,
  filename?: string,
  metadata?: {
    exportedBy?: string
    description?: string
    tags?: string[]
  }
): void {
  try {
    const exportData = exportSettings(settings, metadata)
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download =
      filename ||
      `snake-game-settings-${new Date().toISOString().split('T')[0]}.json`

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up URL
    URL.revokeObjectURL(url)
  } catch (error) {
    throw new Error(`Failed to export settings: ${error}`)
  }
}

/**
 * Import settings from JSON data
 */
export function importSettings(data: unknown): SettingsImportResult {
  try {
    // Validate input data structure
    if (!data || typeof data !== 'object') {
      return {
        success: false,
        error: 'Invalid import data: must be a valid JSON object'
      }
    }

    const importData = data as Record<string, unknown>
    let settingsData: unknown
    const warnings: string[] = []
    let migrated = false

    // Check if this is an export format or raw settings
    if ('settings' in importData && 'exportedAt' in importData) {
      // This is an export format - validate the structure first
      const exportData = importData as unknown as SettingsExport

      if (
        typeof exportData.exportedAt !== 'number' ||
        typeof exportData.settingsVersion !== 'string' ||
        !exportData.settings
      ) {
        return {
          success: false,
          error: 'Invalid export format structure'
        }
      }

      settingsData = exportData.settings

      // Add metadata warnings if applicable
      if (exportData.settingsVersion !== SETTINGS_VERSION) {
        warnings.push(
          `Settings were exported from version ${exportData.settingsVersion}, current version is ${SETTINGS_VERSION}`
        )
      }

      if (
        exportData.appVersion &&
        exportData.appVersion !==
          (process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0')
      ) {
        warnings.push(
          `Settings were exported from app version ${exportData.appVersion}`
        )
      }
    } else {
      // Assume this is raw settings data
      settingsData = importData
    }

    // Check if migration is needed
    if (needsMigration(settingsData)) {
      const migrationResult = migrateSettings(settingsData)

      if (!migrationResult.success) {
        return {
          success: false,
          error: migrationResult.error || 'Migration failed',
          warnings
        }
      }

      settingsData = migrationResult.settings
      migrated = true

      if (migrationResult.warnings) {
        warnings.push(...migrationResult.warnings)
      }

      if (
        migrationResult.migrationsApplied &&
        migrationResult.migrationsApplied.length > 0
      ) {
        warnings.push(
          `Applied migrations: ${migrationResult.migrationsApplied.join(', ')}`
        )
      }
    }

    // Validate the final settings
    const validationResult = validateAppSettings(settingsData)

    if (!validationResult.valid) {
      // Try to sanitize the settings as a fallback
      try {
        const sanitizedSettings = sanitizeSettings(settingsData)
        warnings.push(
          'Some settings were invalid and have been reset to defaults'
        )

        return {
          success: true,
          settings: sanitizedSettings,
          warnings,
          migrated
        }
      } catch {
        return {
          success: false,
          error: `Settings validation failed: ${validationResult.errors?.join(', ')}`,
          warnings
        }
      }
    }

    return {
      success: true,
      settings: validationResult.settings!,
      warnings,
      migrated
    }
  } catch (error) {
    return {
      success: false,
      error: `Import failed: ${error}`,
      warnings: []
    }
  }
}

/**
 * Import settings from file
 */
export function importSettingsFromFile(
  file: File
): Promise<SettingsImportResult> {
  return new Promise((resolve) => {
    // Validate file type
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      resolve({
        success: false,
        error: 'Invalid file type: only JSON files are supported'
      })
      return
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      resolve({
        success: false,
        error: 'File too large: maximum size is 1MB'
      })
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const data = JSON.parse(content)
        resolve(importSettings(data))
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to parse JSON file: ${error}`
        })
      }
    }

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read file'
      })
    }

    reader.readAsText(file)
  })
}

/**
 * Import settings from clipboard
 */
export async function importSettingsFromClipboard(): Promise<SettingsImportResult> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      return {
        success: false,
        error: 'Clipboard access is not supported in this browser'
      }
    }

    const clipboardText = await navigator.clipboard.readText()

    if (!clipboardText.trim()) {
      return {
        success: false,
        error: 'Clipboard is empty'
      }
    }

    const data = JSON.parse(clipboardText)
    return importSettings(data)
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: 'Invalid JSON data in clipboard'
      }
    }

    return {
      success: false,
      error: `Failed to import from clipboard: ${error}`
    }
  }
}

/**
 * Export settings to clipboard
 */
export async function exportSettingsToClipboard(
  settings: AppSettings,
  metadata?: {
    exportedBy?: string
    description?: string
    tags?: string[]
  }
): Promise<boolean> {
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error('Clipboard access is not supported in this browser')
    }

    const exportData = exportSettings(settings, metadata)
    const jsonString = JSON.stringify(exportData, null, 2)

    await navigator.clipboard.writeText(jsonString)
    return true
  } catch (error) {
    console.error('Failed to export to clipboard:', error)
    return false
  }
}

/**
 * Validate export file format
 */
export function validateExportFile(data: unknown): {
  valid: boolean
  isExport: boolean
  error?: string
} {
  try {
    if (!data || typeof data !== 'object') {
      return {
        valid: false,
        isExport: false,
        error: 'Invalid data format'
      }
    }

    const exportData = data as Record<string, unknown>

    // Check if it's an export format
    const isExport =
      'exportedAt' in exportData &&
      'settingsVersion' in exportData &&
      'settings' in exportData

    if (isExport) {
      // Validate export format
      if (typeof exportData.exportedAt !== 'number') {
        return {
          valid: false,
          isExport: true,
          error: 'Invalid export timestamp'
        }
      }

      if (typeof exportData.settingsVersion !== 'string') {
        return {
          valid: false,
          isExport: true,
          error: 'Invalid settings version'
        }
      }

      if (!exportData.settings) {
        return { valid: false, isExport: true, error: 'Missing settings data' }
      }
    }

    return { valid: true, isExport }
  } catch (error) {
    return {
      valid: false,
      isExport: false,
      error: `Validation failed: ${error}`
    }
  }
}

/**
 * Create a shareable settings URL (for future web sharing)
 */
export function createShareableSettingsUrl(settings: AppSettings): string {
  try {
    const exportData = exportSettings(settings, {
      description: 'Shared Snake Game Settings'
    })

    // Compress and encode the data for URL
    const jsonString = JSON.stringify(exportData)
    const compressed = btoa(jsonString) // Base64 encode

    // Create a data URL (for now - in production you might use a sharing service)
    return `data:application/json;base64,${compressed}`
  } catch (error) {
    throw new Error(`Failed to create shareable URL: ${error}`)
  }
}

/**
 * Import settings from shareable URL
 */
export function importSettingsFromUrl(url: string): SettingsImportResult {
  try {
    if (!url.startsWith('data:application/json;base64,')) {
      return {
        success: false,
        error: 'Invalid shareable URL format'
      }
    }

    const base64Data = url.replace('data:application/json;base64,', '')
    const jsonString = atob(base64Data)
    const data = JSON.parse(jsonString)

    return importSettings(data)
  } catch (error) {
    return {
      success: false,
      error: `Failed to import from URL: ${error}`
    }
  }
}

/**
 * Get settings export summary for UI display
 */
export function getExportSummary(exportData: SettingsExport): {
  fileSize: string
  settingsCount: number
  exportDate: string
  version: string
  hasMetadata: boolean
} {
  const jsonString = JSON.stringify(exportData)
  const fileSize = new Blob([jsonString]).size

  // Count settings (approximate)
  const settingsCount = Object.keys(exportData.settings).length

  const exportDate = new Date(exportData.exportedAt).toLocaleDateString()

  return {
    fileSize: formatFileSize(fileSize),
    settingsCount,
    exportDate,
    version: exportData.settingsVersion,
    hasMetadata: !!exportData.metadata
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
