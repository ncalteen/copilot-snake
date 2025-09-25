/**
 * Color validation and conversion utilities
 * Provides comprehensive color manipulation with type safety
 */

/**
 * Supported color formats
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch'

/**
 * RGB color values
 */
export interface RGBColor {
  r: number
  g: number
  b: number
  a?: number
}

/**
 * HSL color values
 */
export interface HSLColor {
  h: number
  s: number
  l: number
  a?: number
}

/**
 * OKLCH color values (used in the theme system)
 */
export interface OKLCHColor {
  l: number
  c: number
  h: number
  a?: number
}

/**
 * Color validation result
 */
export interface ColorValidationResult {
  valid: boolean
  error?: string
  normalizedValue?: string
}

/**
 * Validates a hex color string
 */
export function validateHexColor(hex: string): ColorValidationResult {
  const cleanHex = hex.replace('#', '').trim()

  // Check for valid hex length (3, 4, 6, or 8 characters)
  if (
    !/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{4}$|^[0-9A-Fa-f]{6}$|^[0-9A-Fa-f]{8}$/.test(
      cleanHex
    )
  ) {
    return {
      valid: false,
      error: 'Invalid hex color format. Use #RGB, #RGBA, #RRGGBB, or #RRGGBBAA'
    }
  }

  return {
    valid: true,
    normalizedValue: `#${cleanHex.toUpperCase()}`
  }
}

/**
 * Validates an RGB color string
 */
export function validateRGBColor(rgb: string): ColorValidationResult {
  const rgbMatch = rgb.match(
    /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)(?:\s*,\s*(\d+(?:\.\d+)?))?\s*\)$/i
  )

  if (!rgbMatch) {
    return {
      valid: false,
      error: 'Invalid RGB color format. Use rgb(r, g, b) or rgba(r, g, b, a)'
    }
  }

  const [, r, g, b, a] = rgbMatch
  const rVal = parseFloat(r)
  const gVal = parseFloat(g)
  const bVal = parseFloat(b)
  const aVal = a ? parseFloat(a) : 1

  if (
    rVal < 0 ||
    rVal > 255 ||
    gVal < 0 ||
    gVal > 255 ||
    bVal < 0 ||
    bVal > 255
  ) {
    return {
      valid: false,
      error: 'RGB values must be between 0 and 255'
    }
  }

  if (aVal < 0 || aVal > 1) {
    return {
      valid: false,
      error: 'Alpha value must be between 0 and 1'
    }
  }

  return {
    valid: true,
    normalizedValue: a
      ? `rgba(${Math.round(rVal)}, ${Math.round(gVal)}, ${Math.round(bVal)}, ${aVal})`
      : `rgb(${Math.round(rVal)}, ${Math.round(gVal)}, ${Math.round(bVal)})`
  }
}

/**
 * Validates an HSL color string
 */
export function validateHSLColor(hsl: string): ColorValidationResult {
  const hslMatch = hsl.match(
    /^hsla?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%(?:\s*,\s*(\d+(?:\.\d+)?))?\s*\)$/i
  )

  if (!hslMatch) {
    return {
      valid: false,
      error:
        'Invalid HSL color format. Use hsl(h, s%, l%) or hsla(h, s%, l%, a)'
    }
  }

  const [, h, s, l, a] = hslMatch
  const hVal = parseFloat(h)
  const sVal = parseFloat(s)
  const lVal = parseFloat(l)
  const aVal = a ? parseFloat(a) : 1

  if (hVal < 0 || hVal >= 360) {
    return {
      valid: false,
      error: 'Hue value must be between 0 and 359'
    }
  }

  if (sVal < 0 || sVal > 100) {
    return {
      valid: false,
      error: 'Saturation value must be between 0% and 100%'
    }
  }

  if (lVal < 0 || lVal > 100) {
    return {
      valid: false,
      error: 'Lightness value must be between 0% and 100%'
    }
  }

  if (aVal < 0 || aVal > 1) {
    return {
      valid: false,
      error: 'Alpha value must be between 0 and 1'
    }
  }

  return {
    valid: true,
    normalizedValue: a
      ? `hsla(${Math.round(hVal)}, ${Math.round(sVal)}%, ${Math.round(lVal)}%, ${aVal})`
      : `hsl(${Math.round(hVal)}, ${Math.round(sVal)}%, ${Math.round(lVal)}%)`
  }
}

/**
 * Validates an OKLCH color string (used in theme system)
 */
export function validateOKLCHColor(oklch: string): ColorValidationResult {
  const oklchMatch = oklch.match(
    /^oklch\(\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?%?))?\s*\)$/i
  )

  if (!oklchMatch) {
    return {
      valid: false,
      error: 'Invalid OKLCH color format. Use oklch(l c h) or oklch(l c h / a)'
    }
  }

  const [, l, c, h, a] = oklchMatch
  const lVal = parseFloat(l)
  const cVal = parseFloat(c)
  const hVal = parseFloat(h)
  let aVal = 1

  if (a) {
    aVal = a.includes('%')
      ? parseFloat(a.replace('%', '')) / 100
      : parseFloat(a)
  }

  if (lVal < 0 || lVal > 1) {
    return {
      valid: false,
      error: 'Lightness value must be between 0 and 1'
    }
  }

  if (cVal < 0 || cVal > 0.5) {
    return {
      valid: false,
      error: 'Chroma value must be between 0 and 0.5'
    }
  }

  if (hVal < 0 || hVal >= 360) {
    return {
      valid: false,
      error: 'Hue value must be between 0 and 359'
    }
  }

  if (aVal < 0 || aVal > 1) {
    return {
      valid: false,
      error: 'Alpha value must be between 0 and 1'
    }
  }

  return {
    valid: true,
    normalizedValue: a
      ? `oklch(${lVal.toFixed(3)} ${cVal.toFixed(3)} ${hVal.toFixed(3)} / ${aVal.toFixed(3)})`
      : `oklch(${lVal.toFixed(3)} ${cVal.toFixed(3)} ${hVal.toFixed(3)})`
  }
}

/**
 * Validates any supported color format
 */
export function validateColor(color: string): ColorValidationResult {
  const trimmedColor = color.trim()

  // Try hex format
  if (trimmedColor.startsWith('#')) {
    return validateHexColor(trimmedColor)
  }

  // Try RGB format
  if (trimmedColor.startsWith('rgb')) {
    return validateRGBColor(trimmedColor)
  }

  // Try HSL format
  if (trimmedColor.startsWith('hsl')) {
    return validateHSLColor(trimmedColor)
  }

  // Try OKLCH format
  if (trimmedColor.startsWith('oklch')) {
    return validateOKLCHColor(trimmedColor)
  }

  return {
    valid: false,
    error:
      'Unsupported color format. Use hex (#RRGGBB), RGB, HSL, or OKLCH format'
  }
}

/**
 * Convert hex to RGB
 */
export function hexToRGB(hex: string): RGBColor | null {
  const validation = validateHexColor(hex)
  if (!validation.valid || !validation.normalizedValue) return null

  const cleanHex = validation.normalizedValue.replace('#', '')
  let r: number,
    g: number,
    b: number,
    a: number = 1

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
  } else if (cleanHex.length === 4) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16)
    g = parseInt(cleanHex[1] + cleanHex[1], 16)
    b = parseInt(cleanHex[2] + cleanHex[2], 16)
    a = parseInt(cleanHex[3] + cleanHex[3], 16) / 255
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16)
    g = parseInt(cleanHex.substring(2, 4), 16)
    b = parseInt(cleanHex.substring(4, 6), 16)
  } else if (cleanHex.length === 8) {
    r = parseInt(cleanHex.substring(0, 2), 16)
    g = parseInt(cleanHex.substring(2, 4), 16)
    b = parseInt(cleanHex.substring(4, 6), 16)
    a = parseInt(cleanHex.substring(6, 8), 16) / 255
  } else {
    return null
  }

  return { r, g, b, a }
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (value: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, value))).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  const hexR = toHex(rgb.r)
  const hexG = toHex(rgb.g)
  const hexB = toHex(rgb.b)

  if (rgb.a !== undefined && rgb.a !== 1) {
    const hexA = toHex(rgb.a * 255)
    return `#${hexR}${hexG}${hexB}${hexA}`.toUpperCase()
  }

  return `#${hexR}${hexG}${hexB}`.toUpperCase()
}

/**
 * Convert RGB to HSL
 */
export function rgbToHSL(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min
  const sum = max + min

  const l = sum / 2

  let h = 0
  let s = 0

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - sum) : diff / sum

    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / diff + 2) / 6
        break
      case b:
        h = ((r - g) / diff + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: rgb.a
  }
}

/**
 * Convert HSL to RGB
 */
export function hslToRGB(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
    a: hsl.a
  }
}

/**
 * Get the relative luminance of a color (used for contrast calculations)
 */
export function getRelativeLuminance(rgb: RGBColor): number {
  const sRGBToLinear = (value: number) => {
    const normalized = value / 255
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4)
  }

  const r = sRGBToLinear(rgb.r)
  const g = sRGBToLinear(rgb.g)
  const b = sRGBToLinear(rgb.b)

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Calculate the contrast ratio between two colors
 */
export function getContrastRatio(color1: RGBColor, color2: RGBColor): number {
  const lum1 = getRelativeLuminance(color1)
  const lum2 = getRelativeLuminance(color2)

  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)

  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Parse any color string to RGB
 */
export function parseColorToRGB(color: string): RGBColor | null {
  const validation = validateColor(color)
  if (!validation.valid || !validation.normalizedValue) return null

  const normalized = validation.normalizedValue

  // Handle hex colors
  if (normalized.startsWith('#')) {
    return hexToRGB(normalized)
  }

  // Handle RGB colors
  if (normalized.startsWith('rgb')) {
    const rgbMatch = normalized.match(
      /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+(?:\.\d+)?))?\s*\)$/i
    )
    if (rgbMatch) {
      const [, r, g, b, a] = rgbMatch
      return {
        r: parseInt(r),
        g: parseInt(g),
        b: parseInt(b),
        a: a ? parseFloat(a) : 1
      }
    }
  }

  // Handle HSL colors
  if (normalized.startsWith('hsl')) {
    const hslMatch = normalized.match(
      /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%(?:\s*,\s*(\d+(?:\.\d+)?))?\s*\)$/i
    )
    if (hslMatch) {
      const [, h, s, l, a] = hslMatch
      const hslColor: HSLColor = {
        h: parseInt(h),
        s: parseInt(s),
        l: parseInt(l),
        a: a ? parseFloat(a) : 1
      }
      return hslToRGB(hslColor)
    }
  }

  // OKLCH conversion is complex and would require additional libraries
  // For now, return null for OKLCH colors
  if (normalized.startsWith('oklch')) {
    return null
  }

  return null
}

/**
 * Format RGB color as CSS string
 */
export function formatRGBColor(rgb: RGBColor): string {
  if (rgb.a !== undefined && rgb.a !== 1) {
    return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${rgb.a})`
  }
  return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`
}

/**
 * Format HSL color as CSS string
 */
export function formatHSLColor(hsl: HSLColor): string {
  if (hsl.a !== undefined && hsl.a !== 1) {
    return `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${hsl.a})`
  }
  return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`
}
