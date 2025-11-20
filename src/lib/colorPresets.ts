/**
 * Color palette presets and colorblind-friendly options
 * Provides curated color palettes with accessibility considerations
 */

/**
 * Color preset definition
 */
export interface ColorPreset {
  /** Unique identifier */
  id: string
  /** Display name */
  name: string
  /** Description of the preset */
  description: string
  /** Color values in the preset */
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    /** Game-specific colors */
    game?: {
      snakeBody: string
      snakeHead: string
      foodNormal: string
      foodBonus: string
      gameBorder: string
      gameBackground: string
    }
  }
  /** Whether this preset is colorblind friendly */
  colorblindFriendly: boolean
  /** Accessibility compliance level */
  wcagLevel: 'AA' | 'AAA'
  /** Tags for categorization */
  tags: string[]
}

/**
 * Colorblind type enumeration
 */
export enum ColorblindType {
  PROTANOPIA = 'protanopia', // Red-blind
  DEUTERANOPIA = 'deuteranopia', // Green-blind
  TRITANOPIA = 'tritanopia', // Blue-blind
  MONOCHROMACY = 'monochromacy' // Complete color blindness
}

/**
 * High contrast presets optimized for accessibility
 */
export const HIGH_CONTRAST_PRESETS: ColorPreset[] = [
  {
    id: 'high-contrast-dark',
    name: 'High Contrast Dark',
    description: 'Maximum contrast dark theme for enhanced accessibility',
    colors: {
      primary: '#FFFFFF',
      secondary: '#E5E5E5',
      accent: '#00FF00',
      background: '#000000',
      foreground: '#FFFFFF',
      game: {
        snakeBody: '#00FF00',
        snakeHead: '#FFFFFF',
        foodNormal: '#FF0000',
        foodBonus: '#FFFF00',
        gameBorder: '#FFFFFF',
        gameBackground: '#000000'
      }
    },
    colorblindFriendly: true,
    wcagLevel: 'AAA',
    tags: ['high-contrast', 'dark', 'accessibility', 'colorblind-friendly']
  },
  {
    id: 'high-contrast-light',
    name: 'High Contrast Light',
    description: 'Maximum contrast light theme for enhanced accessibility',
    colors: {
      primary: '#000000',
      secondary: '#333333',
      accent: '#0000FF',
      background: '#FFFFFF',
      foreground: '#000000',
      game: {
        snakeBody: '#0000FF',
        snakeHead: '#000000',
        foodNormal: '#FF0000',
        foodBonus: '#FF8000',
        gameBorder: '#000000',
        gameBackground: '#FFFFFF'
      }
    },
    colorblindFriendly: true,
    wcagLevel: 'AAA',
    tags: ['high-contrast', 'light', 'accessibility', 'colorblind-friendly']
  }
]

/**
 * Colorblind-friendly presets
 */
export const COLORBLIND_FRIENDLY_PRESETS: ColorPreset[] = [
  {
    id: 'protanopia-friendly',
    name: 'Red-Blind Friendly',
    description: 'Optimized for protanopia (red color blindness)',
    colors: {
      primary: '#0173B2',
      secondary: '#DE8F05',
      accent: '#029E73',
      background: '#FFFFFF',
      foreground: '#000000',
      game: {
        snakeBody: '#0173B2',
        snakeHead: '#CC78BC',
        foodNormal: '#DE8F05',
        foodBonus: '#029E73',
        gameBorder: '#56B4E9',
        gameBackground: '#F0F0F0'
      }
    },
    colorblindFriendly: true,
    wcagLevel: 'AA',
    tags: ['colorblind-friendly', 'protanopia', 'accessible']
  },
  {
    id: 'deuteranopia-friendly',
    name: 'Green-Blind Friendly',
    description: 'Optimized for deuteranopia (green color blindness)',
    colors: {
      primary: '#E69F00',
      secondary: '#56B4E9',
      accent: '#CC78BC',
      background: '#FFFFFF',
      foreground: '#000000',
      game: {
        snakeBody: '#E69F00',
        snakeHead: '#CC78BC',
        foodNormal: '#56B4E9',
        foodBonus: '#D55E00',
        gameBorder: '#F0E442',
        gameBackground: '#F8F8F8'
      }
    },
    colorblindFriendly: true,
    wcagLevel: 'AA',
    tags: ['colorblind-friendly', 'deuteranopia', 'accessible']
  },
  {
    id: 'tritanopia-friendly',
    name: 'Blue-Blind Friendly',
    description: 'Optimized for tritanopia (blue color blindness)',
    colors: {
      primary: '#D55E00',
      secondary: '#F0E442',
      accent: '#CC78BC',
      background: '#FFFFFF',
      foreground: '#000000',
      game: {
        snakeBody: '#D55E00',
        snakeHead: '#CC78BC',
        foodNormal: '#F0E442',
        foodBonus: '#E69F00',
        gameBorder: '#009E73',
        gameBackground: '#F5F5F5'
      }
    },
    colorblindFriendly: true,
    wcagLevel: 'AA',
    tags: ['colorblind-friendly', 'tritanopia', 'accessible']
  },
  {
    id: 'monochrome-friendly',
    name: 'Monochrome Friendly',
    description: 'Grayscale palette for complete color blindness',
    colors: {
      primary: '#000000',
      secondary: '#666666',
      accent: '#333333',
      background: '#FFFFFF',
      foreground: '#000000',
      game: {
        snakeBody: '#666666',
        snakeHead: '#000000',
        foodNormal: '#999999',
        foodBonus: '#333333',
        gameBorder: '#CCCCCC',
        gameBackground: '#F9F9F9'
      }
    },
    colorblindFriendly: true,
    wcagLevel: 'AAA',
    tags: ['colorblind-friendly', 'monochrome', 'grayscale', 'accessible']
  }
]

/**
 * Standard theme presets with good accessibility
 */
export const STANDARD_PRESETS: ColorPreset[] = [
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Calming blue theme with ocean-inspired colors',
    colors: {
      primary: '#2563eb',
      secondary: '#3b82f6',
      accent: '#06b6d4',
      background: '#ffffff',
      foreground: '#1e293b',
      game: {
        snakeBody: '#2563eb',
        snakeHead: '#1e40af',
        foodNormal: '#f97316',
        foodBonus: '#eab308',
        gameBorder: '#94a3b8',
        gameBackground: '#f8fafc'
      }
    },
    colorblindFriendly: false,
    wcagLevel: 'AA',
    tags: ['blue', 'calm', 'professional']
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Nature-inspired green theme',
    colors: {
      primary: '#16a34a',
      secondary: '#22c55e',
      accent: '#84cc16',
      background: '#ffffff',
      foreground: '#1e293b',
      game: {
        snakeBody: '#16a34a',
        snakeHead: '#15803d',
        foodNormal: '#dc2626',
        foodBonus: '#f59e0b',
        gameBorder: '#a3a3a3',
        gameBackground: '#f9fafb'
      }
    },
    colorblindFriendly: false,
    wcagLevel: 'AA',
    tags: ['green', 'nature', 'fresh']
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm sunset-inspired theme',
    colors: {
      primary: '#ea580c',
      secondary: '#f97316',
      accent: '#facc15',
      background: '#ffffff',
      foreground: '#1e293b',
      game: {
        snakeBody: '#ea580c',
        snakeHead: '#c2410c',
        foodNormal: '#dc2626',
        foodBonus: '#16a34a',
        gameBorder: '#a3a3a3',
        gameBackground: '#fffbeb'
      }
    },
    colorblindFriendly: false,
    wcagLevel: 'AA',
    tags: ['orange', 'warm', 'energetic']
  },
  {
    id: 'purple-cosmic',
    name: 'Purple Cosmic',
    description: 'Deep space purple theme',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a855f7',
      background: '#ffffff',
      foreground: '#1e293b',
      game: {
        snakeBody: '#7c3aed',
        snakeHead: '#6d28d9',
        foodNormal: '#f59e0b',
        foodBonus: '#10b981',
        gameBorder: '#a3a3a3',
        gameBackground: '#faf5ff'
      }
    },
    colorblindFriendly: false,
    wcagLevel: 'AA',
    tags: ['purple', 'cosmic', 'mysterious']
  }
]

/**
 * Dark theme presets
 */
export const DARK_PRESETS: ColorPreset[] = [
  {
    id: 'dark-blue',
    name: 'Dark Blue',
    description: 'Professional dark blue theme',
    colors: {
      primary: '#60a5fa',
      secondary: '#3b82f6',
      accent: '#06b6d4',
      background: '#0f172a',
      foreground: '#f1f5f9',
      game: {
        snakeBody: '#60a5fa',
        snakeHead: '#3b82f6',
        foodNormal: '#f97316',
        foodBonus: '#eab308',
        gameBorder: '#475569',
        gameBackground: '#1e293b'
      }
    },
    colorblindFriendly: false,
    wcagLevel: 'AA',
    tags: ['dark', 'blue', 'professional']
  },
  {
    id: 'dark-emerald',
    name: 'Dark Emerald',
    description: 'Rich dark theme with emerald accents',
    colors: {
      primary: '#34d399',
      secondary: '#10b981',
      accent: '#6ee7b7',
      background: '#0f172a',
      foreground: '#f1f5f9',
      game: {
        snakeBody: '#34d399',
        snakeHead: '#10b981',
        foodNormal: '#f87171',
        foodBonus: '#fbbf24',
        gameBorder: '#475569',
        gameBackground: '#1e293b'
      }
    },
    colorblindFriendly: false,
    wcagLevel: 'AA',
    tags: ['dark', 'green', 'elegant']
  }
]

/**
 * All available presets
 */
export const ALL_PRESETS: ColorPreset[] = [
  ...HIGH_CONTRAST_PRESETS,
  ...COLORBLIND_FRIENDLY_PRESETS,
  ...STANDARD_PRESETS,
  ...DARK_PRESETS
]

/**
 * Get preset by ID
 */
export function getPresetById(id: string): ColorPreset | null {
  return ALL_PRESETS.find((preset) => preset.id === id) || null
}

/**
 * Get presets by tag
 */
export function getPresetsByTag(tag: string): ColorPreset[] {
  return ALL_PRESETS.filter((preset) => preset.tags.includes(tag))
}

/**
 * Get colorblind-friendly presets
 */
export function getColorblindFriendlyPresets(): ColorPreset[] {
  return ALL_PRESETS.filter((preset) => preset.colorblindFriendly)
}

/**
 * Get high contrast presets
 */
export function getHighContrastPresets(): ColorPreset[] {
  return getPresetsByTag('high-contrast')
}

/**
 * Get presets by WCAG level
 */
export function getPresetsByWCAGLevel(level: 'AA' | 'AAA'): ColorPreset[] {
  return ALL_PRESETS.filter((preset) => preset.wcagLevel === level)
}

/**
 * Get presets suitable for specific colorblind type
 */
export function getPresetsForColorblindType(
  type: ColorblindType
): ColorPreset[] {
  switch (type) {
    case ColorblindType.PROTANOPIA:
      return getPresetsByTag('protanopia')
    case ColorblindType.DEUTERANOPIA:
      return getPresetsByTag('deuteranopia')
    case ColorblindType.TRITANOPIA:
      return getPresetsByTag('tritanopia')
    case ColorblindType.MONOCHROMACY:
      return getPresetsByTag('monochrome')
    default:
      return getColorblindFriendlyPresets()
  }
}

/**
 * Filter presets by criteria
 */
export function filterPresets(criteria: {
  colorblindFriendly?: boolean
  wcagLevel?: 'AA' | 'AAA'
  tags?: string[]
  darkMode?: boolean
}): ColorPreset[] {
  return ALL_PRESETS.filter((preset) => {
    if (
      criteria.colorblindFriendly !== undefined &&
      preset.colorblindFriendly !== criteria.colorblindFriendly
    ) {
      return false
    }

    if (criteria.wcagLevel && preset.wcagLevel !== criteria.wcagLevel) {
      return false
    }

    if (
      criteria.tags &&
      !criteria.tags.some((tag) => preset.tags.includes(tag))
    ) {
      return false
    }

    if (criteria.darkMode !== undefined) {
      const isDark = preset.tags.includes('dark')
      if (criteria.darkMode !== isDark) {
        return false
      }
    }

    return true
  })
}

/**
 * Create a custom preset from colors
 */
export function createCustomPreset(
  name: string,
  colors: ColorPreset['colors'],
  description?: string
): ColorPreset {
  return {
    id: `custom-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    description: description || `Custom color preset: ${name}`,
    colors,
    colorblindFriendly: false, // Would need to be validated
    wcagLevel: 'AA', // Would need to be validated
    tags: ['custom']
  }
}

/**
 * Get recommended presets based on accessibility needs
 */
export function getRecommendedPresets(requirements: {
  highContrast?: boolean
  colorblindFriendly?: boolean
  darkMode?: boolean
  wcagLevel?: 'AA' | 'AAA'
}): ColorPreset[] {
  const presets: ColorPreset[] = []

  if (requirements.highContrast) {
    presets.push(...getHighContrastPresets())
  }

  if (requirements.colorblindFriendly) {
    presets.push(...getColorblindFriendlyPresets())
  }

  if (requirements.wcagLevel) {
    presets.push(...getPresetsByWCAGLevel(requirements.wcagLevel))
  }

  if (requirements.darkMode !== undefined) {
    const darkPresets = getPresetsByTag('dark')
    const lightPresets = ALL_PRESETS.filter((p) => !p.tags.includes('dark'))
    presets.push(...(requirements.darkMode ? darkPresets : lightPresets))
  }

  // Remove duplicates and return unique presets
  const uniquePresets = presets.filter(
    (preset, index, self) => index === self.findIndex((p) => p.id === preset.id)
  )

  return uniquePresets.length > 0 ? uniquePresets : STANDARD_PRESETS
}
