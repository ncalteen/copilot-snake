'use client'

import * as React from 'react'
import { ZoomControl } from './ZoomControl'

import { ColorPreview } from './ColorPreview'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Eye,
  EyeOff,
  MousePointer,
  Keyboard,
  Volume2,
  VolumeX,
  Contrast,
  Zap,
  ZapOff
} from 'lucide-react'
import { useZoom } from '@/contexts/ZoomContext'
import {
  getHighContrastPresets,
  getColorblindFriendlyPresets
} from '@/lib/colorPresets'

/**
 * AccessibilitySettings component props
 */
export interface AccessibilitySettingsProps {
  /** Accessibility settings */
  settings: {
    highContrast: boolean
    reduceMotion: boolean
    enhancedFocus: boolean
    screenReaderAnnouncements: boolean
    keyboardOnly: boolean
    zoomLevel: number
    enablePanning: boolean
  }
  /** Callback when settings change */
  onSettingsChange: (
    updates: Partial<AccessibilitySettingsProps['settings']>
  ) => void
  /** Additional CSS class */
  className?: string
}

/**
 * Comprehensive accessibility settings component
 * Includes zoom controls, high contrast options, and visual assistance features
 */
export function AccessibilitySettings({
  settings,
  onSettingsChange,
  className
}: AccessibilitySettingsProps) {
  const zoom = useZoom()

  // Sync zoom context with settings
  React.useEffect(() => {
    if (zoom.zoomLevel !== settings.zoomLevel) {
      zoom.setZoomLevel(settings.zoomLevel)
    }
    if (zoom.enablePanning !== settings.enablePanning) {
      zoom.setEnablePanning(settings.enablePanning)
    }
  }, [settings.zoomLevel, settings.enablePanning, zoom])

  const handleZoomChange = (zoomLevel: number) => {
    onSettingsChange({ zoomLevel })
  }

  const handlePanningChange = (enablePanning: boolean) => {
    onSettingsChange({ enablePanning })
  }

  const handleToggleSetting = (key: keyof typeof settings) => {
    onSettingsChange({ [key]: !settings[key] })
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h2 className="text-lg font-semibold mb-2">Accessibility Settings</h2>
        <p className="text-sm text-muted-foreground">
          Customize the interface for improved accessibility and visual comfort
        </p>
      </div>

      {/* Zoom Controls */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3">
          <h3 className="text-base font-medium flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visual Magnification
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Increase interface size for better visibility
          </p>
        </div>
        <ZoomControl
          zoomLevel={settings.zoomLevel}
          onZoomChange={handleZoomChange}
          enablePanning={settings.enablePanning}
          onPanningChange={handlePanningChange}
          showPercentage={true}
        />
      </div>

      {/* Visual Settings */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3">
          <h3 className="text-base font-medium flex items-center gap-2">
            <Contrast className="h-4 w-4" />
            Visual Enhancements
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Adjust visual elements for better contrast and clarity
          </p>
        </div>

        <div className="space-y-4">
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium">High Contrast Mode</label>
              <p className="text-xs text-muted-foreground">
                Increases contrast for better visibility
              </p>
            </div>
            <Button
              variant={settings.highContrast ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToggleSetting('highContrast')}
              className="ml-4">
              {settings.highContrast ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Enhanced Focus */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium">
                Enhanced Focus Rings
              </label>
              <p className="text-xs text-muted-foreground">
                More visible focus indicators for keyboard navigation
              </p>
            </div>
            <Button
              variant={settings.enhancedFocus ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToggleSetting('enhancedFocus')}
              className="ml-4">
              {settings.enhancedFocus ? (
                <MousePointer className="h-4 w-4" />
              ) : (
                <MousePointer className="h-4 w-4 opacity-50" />
              )}
            </Button>
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium">Reduce Motion</label>
              <p className="text-xs text-muted-foreground">
                Minimizes animations to prevent vestibular disorders
              </p>
            </div>
            <Button
              variant={settings.reduceMotion ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToggleSetting('reduceMotion')}
              className="ml-4">
              {settings.reduceMotion ? (
                <ZapOff className="h-4 w-4" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Settings */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3">
          <h3 className="text-base font-medium flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            Navigation & Input
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure input methods and navigation preferences
          </p>
        </div>

        <div className="space-y-4">
          {/* Keyboard Only */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium">
                Keyboard Navigation Only
              </label>
              <p className="text-xs text-muted-foreground">
                Optimizes interface for keyboard-only navigation
              </p>
            </div>
            <Button
              variant={settings.keyboardOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToggleSetting('keyboardOnly')}
              className="ml-4">
              <Keyboard className="h-4 w-4" />
            </Button>
          </div>

          {/* Screen Reader */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium">
                Screen Reader Announcements
              </label>
              <p className="text-xs text-muted-foreground">
                Provides audio feedback for screen readers
              </p>
            </div>
            <Button
              variant={
                settings.screenReaderAnnouncements ? 'default' : 'outline'
              }
              size="sm"
              onClick={() => handleToggleSetting('screenReaderAnnouncements')}
              className="ml-4">
              {settings.screenReaderAnnouncements ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Accessibility Color Presets */}
      <AccessibilityColorPresets />

      {/* Zoom Status Indicator */}
      {zoom.isZoomed && (
        <div className="rounded-md bg-primary/10 border border-primary/20 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Zoom Active: {Math.round(zoom.zoomLevel * 100)}%
              </p>
              <p className="text-xs text-muted-foreground">
                {zoom.enablePanning
                  ? 'Click and drag to pan the interface'
                  : 'Enable panning for easier navigation'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={zoom.resetPan}
              disabled={!zoom.enablePanning}
              className="text-xs">
              Center View
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Accessibility-focused color presets section
 */
function AccessibilityColorPresets() {
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(
    null
  )
  const [previewColors, setPreviewColors] = React.useState({
    primary: '#000000',
    background: '#ffffff'
  })

  const highContrastPresets = getHighContrastPresets()
  const colorblindPresets = getColorblindFriendlyPresets()

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId)
    const allPresets = [...highContrastPresets, ...colorblindPresets]
    const preset = allPresets.find((p) => p.id === presetId)
    if (preset) {
      setPreviewColors({
        primary: preset.colors.primary,
        background: preset.colors.background
      })
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3">
        <h3 className="text-base font-medium">Accessibility Color Themes</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Pre-configured color schemes optimized for accessibility
        </p>
      </div>

      <div className="space-y-4">
        {/* High Contrast Presets */}
        <div>
          <h4 className="text-sm font-medium mb-2">High Contrast</h4>
          <div className="grid grid-cols-2 gap-2">
            {highContrastPresets.map((preset) => (
              <Button
                key={preset.id}
                variant={selectedPreset === preset.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetSelect(preset.id)}
                className="justify-start text-left h-auto p-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: preset.colors.background }}
                    />
                  </div>
                  <div className="text-xs">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-muted-foreground">
                      {preset.wcagLevel}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Colorblind Friendly Presets */}
        <div>
          <h4 className="text-sm font-medium mb-2">Colorblind Friendly</h4>
          <div className="grid grid-cols-2 gap-2">
            {colorblindPresets.slice(0, 4).map((preset) => (
              <Button
                key={preset.id}
                variant={selectedPreset === preset.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetSelect(preset.id)}
                className="justify-start text-left h-auto p-2">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div
                      className="w-3 h-3 rounded-sm border"
                      style={{ backgroundColor: preset.colors.background }}
                    />
                  </div>
                  <div className="text-xs">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-muted-foreground">CB Friendly</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Color Preview */}
        {selectedPreset && (
          <div className="mt-3">
            <ColorPreview
              primaryColor={previewColors.primary}
              backgroundColor={previewColors.background}
              variant="text"
              size="sm"
              showAccessibilityInfo={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}
