/**
 * Color accessibility and contrast validation utilities
 * Ensures color combinations meet WCAG guidelines
 */

import { getContrastRatio, parseColorToRGB } from './colorUtils'

/**
 * WCAG compliance levels
 */
export type WCAGLevel = 'AA' | 'AAA'

/**
 * Content types for WCAG testing
 */
export type ContentType = 'normal' | 'large' | 'ui'

/**
 * Color accessibility test result
 */
export interface AccessibilityTestResult {
  /** Whether the color combination passes the test */
  passes: boolean
  /** Contrast ratio between the colors */
  contrastRatio: number
  /** WCAG level achieved */
  level: WCAGLevel | null
  /** Content types that pass */
  passesFor: ContentType[]
  /** Recommendation for improvement */
  recommendation?: string
}

/**
 * Color accessibility report
 */
export interface AccessibilityReport {
  /** Overall accessibility score (0-100) */
  score: number
  /** Individual test results */
  tests: {
    normalText: AccessibilityTestResult
    largeText: AccessibilityTestResult
    uiComponents: AccessibilityTestResult
  }
  /** General recommendations */
  recommendations: string[]
  /** Whether the combination is colorblind friendly */
  colorblindFriendly: boolean
}

/**
 * WCAG contrast requirements
 */
const WCAG_REQUIREMENTS = {
  AA: {
    normal: 4.5, // Normal text
    large: 3.0, // Large text (18pt+ or 14pt+ bold)
    ui: 3.0 // UI components and graphics
  },
  AAA: {
    normal: 7.0, // Enhanced contrast for normal text
    large: 4.5, // Enhanced contrast for large text
    ui: 4.5 // Enhanced contrast for UI components
  }
}

/**
 * Test color contrast against WCAG guidelines
 */
export function testColorContrast(
  foreground: string,
  background: string,
  contentType: ContentType = 'normal'
): AccessibilityTestResult {
  const fgRGB = parseColorToRGB(foreground)
  const bgRGB = parseColorToRGB(background)

  if (!fgRGB || !bgRGB) {
    return {
      passes: false,
      contrastRatio: 0,
      level: null,
      passesFor: [],
      recommendation: 'Invalid color format provided'
    }
  }

  const contrastRatio = getContrastRatio(fgRGB, bgRGB)
  const passesFor: ContentType[] = []
  let level: WCAGLevel | null = null

  // Check AA compliance
  const aaRequirement = WCAG_REQUIREMENTS.AA[contentType]
  const aaaRequirement = WCAG_REQUIREMENTS.AAA[contentType]

  if (contrastRatio >= aaaRequirement) {
    level = 'AAA'
    passesFor.push(contentType)
  } else if (contrastRatio >= aaRequirement) {
    level = 'AA'
    passesFor.push(contentType)
  }

  // Check what content types this ratio works for
  if (contrastRatio >= WCAG_REQUIREMENTS.AA.large) passesFor.push('large')
  if (contrastRatio >= WCAG_REQUIREMENTS.AA.ui) passesFor.push('ui')
  if (contrastRatio >= WCAG_REQUIREMENTS.AA.normal) passesFor.push('normal')

  const passes = contrastRatio >= aaRequirement

  let recommendation: string | undefined
  if (!passes) {
    const needed = aaRequirement
    const improvement = Math.ceil((needed / contrastRatio) * 100) - 100
    recommendation = `Increase contrast by ${improvement}% to meet WCAG AA standards`
  } else if (level === 'AA' && contrastRatio < aaaRequirement) {
    recommendation =
      'Consider increasing contrast to meet WCAG AAA standards for enhanced accessibility'
  }

  return {
    passes,
    contrastRatio: Math.round(contrastRatio * 100) / 100,
    level,
    passesFor: [...new Set(passesFor)],
    recommendation
  }
}

/**
 * Generate comprehensive accessibility report for color combination
 */
export function generateAccessibilityReport(
  foreground: string,
  background: string
): AccessibilityReport {
  const normalTest = testColorContrast(foreground, background, 'normal')
  const largeTest = testColorContrast(foreground, background, 'large')
  const uiTest = testColorContrast(foreground, background, 'ui')

  const recommendations: string[] = []
  let score = 0

  // Calculate score based on compliance levels
  if (normalTest.level === 'AAA') score += 40
  else if (normalTest.level === 'AA') score += 25
  else if (normalTest.passes) score += 15

  if (largeTest.level === 'AAA') score += 30
  else if (largeTest.level === 'AA') score += 20
  else if (largeTest.passes) score += 10

  if (uiTest.level === 'AAA') score += 30
  else if (uiTest.level === 'AA') score += 20
  else if (uiTest.passes) score += 10

  // Add recommendations
  if (!normalTest.passes) {
    recommendations.push('Color combination fails WCAG AA for normal text')
  }
  if (!largeTest.passes) {
    recommendations.push('Color combination fails WCAG AA for large text')
  }
  if (!uiTest.passes) {
    recommendations.push('Color combination fails WCAG AA for UI components')
  }

  if (score < 50) {
    recommendations.push(
      'Consider using higher contrast colors for better accessibility'
    )
  }

  // Check colorblind friendliness (simplified check)
  const colorblindFriendly = isColorblindFriendly(foreground, background)
  if (!colorblindFriendly) {
    recommendations.push(
      'Consider color combinations that are more distinguishable for colorblind users'
    )
  }

  return {
    score: Math.min(100, score),
    tests: {
      normalText: normalTest,
      largeText: largeTest,
      uiComponents: uiTest
    },
    recommendations,
    colorblindFriendly
  }
}

/**
 * Simple colorblind friendliness check
 * This is a basic implementation - a full implementation would use more sophisticated algorithms
 */
export function isColorblindFriendly(
  foreground: string,
  background: string
): boolean {
  const fgRGB = parseColorToRGB(foreground)
  const bgRGB = parseColorToRGB(background)

  if (!fgRGB || !bgRGB) return false

  // Check if colors have sufficient difference in brightness and saturation
  const fgBrightness = (fgRGB.r * 299 + fgRGB.g * 587 + fgRGB.b * 114) / 1000
  const bgBrightness = (bgRGB.r * 299 + bgRGB.g * 587 + bgRGB.b * 114) / 1000
  const brightnessDiff = Math.abs(fgBrightness - bgBrightness)

  // Check color difference (simplified W3C formula)
  const colorDiff =
    Math.abs(fgRGB.r - bgRGB.r) +
    Math.abs(fgRGB.g - bgRGB.g) +
    Math.abs(fgRGB.b - bgRGB.b)

  // Basic thresholds for colorblind friendliness
  return brightnessDiff > 125 && colorDiff > 500
}

/**
 * Suggest accessible color adjustments
 */
export function suggestAccessibleColors(
  foreground: string,
  background: string,
  targetLevel: WCAGLevel = 'AA'
): { foreground: string; background: string } | null {
  const fgRGB = parseColorToRGB(foreground)
  const bgRGB = parseColorToRGB(background)

  if (!fgRGB || !bgRGB) return null

  const currentRatio = getContrastRatio(fgRGB, bgRGB)
  const targetRatio = WCAG_REQUIREMENTS[targetLevel].normal

  if (currentRatio >= targetRatio) {
    return { foreground, background }
  }

  // Simple adjustment: darken foreground or lighten background
  const fgBrightness = (fgRGB.r + fgRGB.g + fgRGB.b) / 3
  const bgBrightness = (bgRGB.r + bgRGB.g + bgRGB.b) / 3

  const adjustedFg = { ...fgRGB }
  const adjustedBg = { ...bgRGB }

  // If foreground is lighter than background, lighten it more
  if (fgBrightness > bgBrightness) {
    const factor = Math.sqrt(targetRatio / currentRatio)
    adjustedFg.r = Math.min(255, adjustedFg.r * factor)
    adjustedFg.g = Math.min(255, adjustedFg.g * factor)
    adjustedFg.b = Math.min(255, adjustedFg.b * factor)
  } else {
    // Otherwise, darken the foreground
    const factor = Math.sqrt(currentRatio / targetRatio)
    adjustedFg.r = Math.max(0, adjustedFg.r * factor)
    adjustedFg.g = Math.max(0, adjustedFg.g * factor)
    adjustedFg.b = Math.max(0, adjustedFg.b * factor)
  }

  return {
    foreground: `rgb(${Math.round(adjustedFg.r)}, ${Math.round(adjustedFg.g)}, ${Math.round(adjustedFg.b)})`,
    background: `rgb(${Math.round(adjustedBg.r)}, ${Math.round(adjustedBg.g)}, ${Math.round(adjustedBg.b)})`
  }
}

/**
 * Check if a color meets minimum contrast requirements for the theme system
 */
export function meetsThemeContrast(
  color: string,
  backgroundColor: string
): boolean {
  const test = testColorContrast(color, backgroundColor, 'normal')
  return test.passes
}

/**
 * Validate color combination for UI components
 */
export function validateUIColorCombination(
  primary: string,
  background: string,
  secondary?: string
): {
  valid: boolean
  issues: string[]
  score: number
} {
  const issues: string[] = []
  let score = 100

  // Test primary against background
  const primaryTest = testColorContrast(primary, background, 'ui')
  if (!primaryTest.passes) {
    issues.push(
      'Primary color does not meet contrast requirements against background'
    )
    score -= 30
  }

  // Test secondary against background if provided
  if (secondary) {
    const secondaryTest = testColorContrast(secondary, background, 'ui')
    if (!secondaryTest.passes) {
      issues.push(
        'Secondary color does not meet contrast requirements against background'
      )
      score -= 20
    }

    // Test primary against secondary
    const primarySecondaryTest = testColorContrast(primary, secondary, 'ui')
    if (!primarySecondaryTest.passes) {
      issues.push(
        'Primary and secondary colors do not have sufficient contrast'
      )
      score -= 20
    }
  }

  // Check colorblind friendliness
  if (!isColorblindFriendly(primary, background)) {
    issues.push(
      'Color combination may not be distinguishable for colorblind users'
    )
    score -= 15
  }

  return {
    valid: issues.length === 0,
    issues,
    score: Math.max(0, score)
  }
}
