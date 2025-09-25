'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Minus, Plus, RotateCcw, Move } from 'lucide-react'

/**
 * ZoomControl component props
 */
export interface ZoomControlProps {
  /** Current zoom level (0.5-3.0) */
  zoomLevel: number
  /** Callback when zoom level changes */
  onZoomChange: (level: number) => void
  /** Whether panning is enabled */
  enablePanning: boolean
  /** Callback when panning setting changes */
  onPanningChange: (enabled: boolean) => void
  /** Whether the control is disabled */
  disabled?: boolean
  /** Additional CSS class */
  className?: string
  /** Label for accessibility */
  label?: string
  /** Show zoom percentage */
  showPercentage?: boolean
}

/**
 * Zoom control component for visually impaired users
 * Provides zoom level adjustment with preset levels and panning controls
 */
export function ZoomControl({
  zoomLevel,
  onZoomChange,
  enablePanning,
  onPanningChange,
  disabled = false,
  className,
  label = 'Zoom Controls',
  showPercentage = true
}: ZoomControlProps) {
  // Predefined zoom levels for common use cases
  const zoomPresets = [
    { value: 0.75, label: '75%' },
    { value: 1.0, label: '100%' },
    { value: 1.25, label: '125%' },
    { value: 1.5, label: '150%' },
    { value: 2.0, label: '200%' },
    { value: 2.5, label: '250%' },
    { value: 3.0, label: '300%' }
  ]

  const handleZoomIn = () => {
    const newLevel = Math.min(3.0, zoomLevel + 0.25)
    onZoomChange(newLevel)
  }

  const handleZoomOut = () => {
    const newLevel = Math.max(0.5, zoomLevel - 0.25)
    onZoomChange(newLevel)
  }

  const handleReset = () => {
    onZoomChange(1.0)
  }

  const handlePresetClick = (preset: number) => {
    onZoomChange(preset)
  }

  const formatZoomPercentage = (level: number) => {
    return `${Math.round(level * 100)}%`
  }

  const isZoomInDisabled = disabled || zoomLevel >= 3.0
  const isZoomOutDisabled = disabled || zoomLevel <= 0.5

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">{label}</label>
          {showPercentage && (
            <span className="text-sm text-muted-foreground">
              {formatZoomPercentage(zoomLevel)}
            </span>
          )}
        </div>
      )}

      {/* Zoom Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomOut}
          disabled={isZoomOutDisabled}
          aria-label="Zoom out"
          className="px-2">
          <Minus className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <input
            type="range"
            min="0.5"
            max="3.0"
            step="0.25"
            value={zoomLevel}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            disabled={disabled}
            aria-label="Zoom level slider"
            className="w-full"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleZoomIn}
          disabled={isZoomInDisabled}
          aria-label="Zoom in"
          className="px-2">
          <Plus className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={disabled}
          aria-label="Reset zoom to 100%"
          className="px-2">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Zoom Presets */}
      <div className="flex flex-wrap gap-1">
        {zoomPresets.map((preset) => (
          <Button
            key={preset.value}
            variant={zoomLevel === preset.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(preset.value)}
            disabled={disabled}
            className="px-2 py-1 text-xs">
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Panning Control */}
      <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3">
        <div className="flex items-center space-x-2">
          <Move className="h-4 w-4 text-muted-foreground" />
          <div>
            <label
              htmlFor="panning-toggle"
              className="text-sm font-medium cursor-pointer">
              Enable Panning
            </label>
            <p className="text-xs text-muted-foreground">
              Allow dragging to navigate when zoomed in
            </p>
          </div>
        </div>
        <input
          id="panning-toggle"
          type="checkbox"
          checked={enablePanning}
          onChange={(e) => onPanningChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Zoom Level Indicator */}
      {zoomLevel !== 1.0 && (
        <div className="rounded-md bg-primary/10 p-2 text-center">
          <p className="text-sm text-primary">
            Interface scaled to {formatZoomPercentage(zoomLevel)}
            {zoomLevel > 1.5 && (
              <span className="ml-2 text-xs">
                (Panning recommended for navigation)
              </span>
            )}
          </p>
          {zoomLevel > 2.0 && !enablePanning && (
            <p className="mt-1 text-xs text-muted-foreground">
              💡 Enable panning for easier navigation at high zoom levels
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Simple zoom level display component
 */
export function ZoomIndicator({
  zoomLevel,
  className
}: {
  zoomLevel: number
  className?: string
}) {
  if (zoomLevel === 1.0) return null

  return (
    <div className={cn('text-xs text-muted-foreground', className)}>
      Zoom: {Math.round(zoomLevel * 100)}%
    </div>
  )
}

/**
 * Hook for managing zoom state with localStorage persistence
 */
export function useZoomControl(initialZoomLevel = 1.0, initialPanning = false) {
  const [zoomLevel, setZoomLevel] = React.useState(initialZoomLevel)
  const [enablePanning, setEnablePanning] = React.useState(initialPanning)

  // Persist zoom settings to localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('accessibility-zoom')
      if (saved) {
        const { zoom, panning } = JSON.parse(saved)
        setZoomLevel(zoom || 1.0)
        setEnablePanning(panning || false)
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  React.useEffect(() => {
    try {
      localStorage.setItem(
        'accessibility-zoom',
        JSON.stringify({ zoom: zoomLevel, panning: enablePanning })
      )
    } catch {
      // Ignore localStorage errors
    }
  }, [zoomLevel, enablePanning])

  return {
    zoomLevel,
    setZoomLevel,
    enablePanning,
    setEnablePanning
  }
}

/**
 * Apply zoom styles to a target element
 */
export function applyZoomStyles(
  element: HTMLElement,
  zoomLevel: number,
  enablePanning: boolean
) {
  if (!element) return

  element.style.transform = `scale(${zoomLevel})`
  element.style.transformOrigin = 'top left'
  element.style.width = `${100 / zoomLevel}%`
  element.style.height = `${100 / zoomLevel}%`

  if (enablePanning && zoomLevel > 1.0) {
    element.style.cursor = 'grab'
  } else {
    element.style.cursor = 'default'
  }
}
