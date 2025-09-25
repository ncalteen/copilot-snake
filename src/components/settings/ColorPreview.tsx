'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  generateAccessibilityReport,
  type AccessibilityReport
} from '@/lib/colorAccessibility'
import { validateColor } from '@/lib/colorUtils'

/**
 * ColorPreview component props
 */
export interface ColorPreviewProps {
  /** Primary color to preview */
  primaryColor: string
  /** Background color for preview */
  backgroundColor: string
  /** Secondary color (optional) */
  secondaryColor?: string
  /** Additional CSS class */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show accessibility information */
  showAccessibilityInfo?: boolean
  /** Preview style variant */
  variant?: 'card' | 'swatch' | 'text' | 'game'
  /** Custom preview content */
  children?: React.ReactNode
}

/**
 * Real-time color preview component with accessibility feedback
 */
export function ColorPreview({
  primaryColor,
  backgroundColor,
  secondaryColor,
  className,
  size = 'md',
  showAccessibilityInfo = false,
  variant = 'card',
  children
}: ColorPreviewProps) {
  const [accessibilityReport, setAccessibilityReport] =
    React.useState<AccessibilityReport | null>(null)
  const [colorErrors, setColorErrors] = React.useState<string[]>([])

  // Validate colors and generate accessibility report
  React.useEffect(() => {
    const errors: string[] = []

    // Validate primary color
    const primaryValidation = validateColor(primaryColor)
    if (!primaryValidation.valid) {
      errors.push(`Primary color: ${primaryValidation.error}`)
    }

    // Validate background color
    const backgroundValidation = validateColor(backgroundColor)
    if (!backgroundValidation.valid) {
      errors.push(`Background color: ${backgroundValidation.error}`)
    }

    // Validate secondary color if provided
    if (secondaryColor) {
      const secondaryValidation = validateColor(secondaryColor)
      if (!secondaryValidation.valid) {
        errors.push(`Secondary color: ${secondaryValidation.error}`)
      }
    }

    setColorErrors(errors)

    // Generate accessibility report if colors are valid
    if (
      primaryValidation.valid &&
      backgroundValidation.valid &&
      showAccessibilityInfo
    ) {
      const report = generateAccessibilityReport(primaryColor, backgroundColor)
      setAccessibilityReport(report)
    } else {
      setAccessibilityReport(null)
    }
  }, [primaryColor, backgroundColor, secondaryColor, showAccessibilityInfo])

  const sizeClasses = {
    sm: 'h-16 w-32 text-sm',
    md: 'h-24 w-48 text-base',
    lg: 'h-32 w-64 text-lg'
  }

  const getVariantContent = () => {
    switch (variant) {
      case 'swatch':
        return (
          <div className="grid h-full w-full grid-cols-2">
            <div
              className="flex items-center justify-center rounded-l-md border-r"
              style={{ backgroundColor: primaryColor, color: backgroundColor }}>
              <span className="text-xs font-medium">Primary</span>
            </div>
            <div
              className="flex items-center justify-center rounded-r-md"
              style={{ backgroundColor: backgroundColor, color: primaryColor }}>
              <span className="text-xs font-medium">Background</span>
            </div>
          </div>
        )

      case 'text':
        return (
          <div
            className="flex h-full w-full flex-col items-center justify-center rounded-md px-4"
            style={{ backgroundColor: backgroundColor, color: primaryColor }}>
            <h3 className="font-semibold">Sample Text</h3>
            <p className="text-sm opacity-80">Preview text content</p>
            {secondaryColor && (
              <span className="mt-1 text-xs" style={{ color: secondaryColor }}>
                Secondary text
              </span>
            )}
          </div>
        )

      case 'game':
        return (
          <div
            className="flex h-full w-full items-center justify-center rounded-md"
            style={{ backgroundColor: backgroundColor }}
            role="img"
            aria-label="Game preview showing snake and food">
            <div className="relative">
              {/* Snake preview */}
              <div
                className="h-4 w-4 rounded-sm border"
                style={{
                  backgroundColor: primaryColor,
                  borderColor: secondaryColor || primaryColor
                }}
              />
              <div
                className="ml-4 mt-1 h-3 w-3 rounded-sm"
                style={{ backgroundColor: primaryColor }}
              />
              <div
                className="ml-7 mt-1 h-3 w-3 rounded-sm"
                style={{ backgroundColor: primaryColor }}
              />
              {/* Food preview */}
              <div
                className="absolute -right-8 top-0 h-3 w-3 rounded-full"
                style={{ backgroundColor: secondaryColor || '#ff0000' }}
              />
            </div>
          </div>
        )

      case 'card':
      default:
        return (
          <div
            className="flex h-full w-full flex-col rounded-md p-3"
            style={{ backgroundColor: backgroundColor, color: primaryColor }}>
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Preview</h4>
              {secondaryColor && (
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: secondaryColor }}
                />
              )}
            </div>
            <div className="mt-2 flex-1">
              <p className="text-sm opacity-80">
                Color combination preview with sample content.
              </p>
            </div>
            {children}
          </div>
        )
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Preview area */}
      <div
        className={cn(
          'overflow-hidden rounded-lg border border-border bg-background shadow-sm',
          sizeClasses[size]
        )}>
        {getVariantContent()}
      </div>

      {/* Color errors */}
      {colorErrors.length > 0 && (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
          <h4 className="text-sm font-medium text-destructive">
            Color Validation Errors
          </h4>
          <ul className="mt-1 space-y-1">
            {colorErrors.map((error, index) => (
              <li key={index} className="text-xs text-destructive/80">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accessibility information */}
      {showAccessibilityInfo && accessibilityReport && (
        <div className="rounded-md border border-border bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-medium">Accessibility Report</h4>
            <div className="flex items-center space-x-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  accessibilityReport.score >= 80
                    ? 'bg-green-500'
                    : accessibilityReport.score >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                )}
                aria-label={
                  accessibilityReport.score >= 80
                    ? 'Good accessibility score'
                    : accessibilityReport.score >= 60
                      ? 'Fair accessibility score'
                      : 'Poor accessibility score'
                }
              />
              <span className="text-xs text-muted-foreground">
                {accessibilityReport.score}/100
              </span>
            </div>
          </div>

          {/* Test results */}
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="font-medium">Normal:</span>
                <span
                  className={cn(
                    'ml-1',
                    accessibilityReport.tests.normalText.passes
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}>
                  {accessibilityReport.tests.normalText.level || 'FAIL'}
                </span>
              </div>
              <div>
                <span className="font-medium">Large:</span>
                <span
                  className={cn(
                    'ml-1',
                    accessibilityReport.tests.largeText.passes
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}>
                  {accessibilityReport.tests.largeText.level || 'FAIL'}
                </span>
              </div>
              <div>
                <span className="font-medium">UI:</span>
                <span
                  className={cn(
                    'ml-1',
                    accessibilityReport.tests.uiComponents.passes
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}>
                  {accessibilityReport.tests.uiComponents.level || 'FAIL'}
                </span>
              </div>
            </div>

            <div className="text-xs">
              <span className="font-medium">Contrast:</span>
              <span className="ml-1 text-muted-foreground">
                {accessibilityReport.tests.normalText.contrastRatio}:1
              </span>
            </div>

            {accessibilityReport.colorblindFriendly && (
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>Colorblind friendly</span>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {accessibilityReport.recommendations.length > 0 && (
            <div className="mt-3 space-y-1">
              <h5 className="text-xs font-medium">Recommendations:</h5>
              {accessibilityReport.recommendations.map((rec, index) => (
                <p key={index} className="text-xs text-muted-foreground">
                  • {rec}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Simple color swatch preview
 */
export function ColorSwatch({
  color,
  label,
  size = 'md',
  className
}: {
  color: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  return (
    <div className={cn('flex flex-col items-center space-y-1', className)}>
      <div
        className={cn(
          'rounded-md border border-border shadow-sm',
          sizeClasses[size]
        )}
        style={{ backgroundColor: color }}
      />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  )
}

/**
 * Color comparison preview for before/after scenarios
 */
export function ColorComparison({
  beforeColor,
  afterColor,
  backgroundColor = '#ffffff',
  label,
  className
}: {
  beforeColor: string
  afterColor: string
  backgroundColor?: string
  label?: string
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <h4 className="text-sm font-medium">{label}</h4>}
      <div className="flex space-x-2">
        <div className="flex-1">
          <ColorPreview
            primaryColor={beforeColor}
            backgroundColor={backgroundColor}
            size="sm"
            variant="text"
          />
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Before
          </p>
        </div>
        <div className="flex items-center">
          <span className="text-muted-foreground">→</span>
        </div>
        <div className="flex-1">
          <ColorPreview
            primaryColor={afterColor}
            backgroundColor={backgroundColor}
            size="sm"
            variant="text"
          />
          <p className="mt-1 text-center text-xs text-muted-foreground">
            After
          </p>
        </div>
      </div>
    </div>
  )
}
