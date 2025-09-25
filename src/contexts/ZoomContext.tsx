'use client'

import * as React from 'react'
import { applyZoomStyles } from '@/components/settings/ZoomControl'

/**
 * Zoom context value interface
 */
export interface ZoomContextValue {
  /** Current zoom level */
  zoomLevel: number
  /** Whether panning is enabled */
  enablePanning: boolean
  /** Set zoom level */
  setZoomLevel: (level: number) => void
  /** Set panning enabled state */
  setEnablePanning: (enabled: boolean) => void
  /** Whether zoom is currently applied */
  isZoomed: boolean
  /** Pan offset coordinates */
  panOffset: { x: number; y: number }
  /** Set pan offset */
  setPanOffset: (offset: { x: number; y: number }) => void
  /** Reset pan to center */
  resetPan: () => void
}

/**
 * Zoom context
 */
export const ZoomContext = React.createContext<ZoomContextValue | null>(null)

/**
 * Zoom provider props
 */
export interface ZoomProviderProps {
  children: React.ReactNode
  /** Target element selector for zoom application */
  targetSelector?: string
  /** Default zoom level */
  defaultZoomLevel?: number
  /** Default panning enabled state */
  defaultPanning?: boolean
}

/**
 * Zoom provider component
 * Manages zoom state and applies zoom transforms to target elements
 */
export function ZoomProvider({
  children,
  targetSelector = 'main',
  defaultZoomLevel = 1.0,
  defaultPanning = false
}: ZoomProviderProps) {
  const [zoomLevel, setZoomLevel] = React.useState(defaultZoomLevel)
  const [enablePanning, setEnablePanning] = React.useState(defaultPanning)
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const targetElementRef = React.useRef<HTMLElement | null>(null)

  const isZoomed = zoomLevel !== 1.0

  // Find and store reference to target element
  React.useEffect(() => {
    const element = document.querySelector(targetSelector) as HTMLElement
    if (element) {
      targetElementRef.current = element
    }
  }, [targetSelector])

  // Apply zoom styles to target element
  React.useEffect(() => {
    const element = targetElementRef.current
    if (!element) return

    applyZoomStyles(element, zoomLevel, enablePanning)

    // Apply pan offset
    if (enablePanning && isZoomed) {
      const transform = `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`
      element.style.transform = transform
    }
  }, [zoomLevel, enablePanning, panOffset, isZoomed])

  // Reset pan when zoom level changes
  React.useEffect(() => {
    setPanOffset({ x: 0, y: 0 })
  }, [zoomLevel])

  // Reset pan function
  const resetPan = React.useCallback(() => {
    setPanOffset({ x: 0, y: 0 })
  }, [])

  // Pan interaction handlers
  React.useEffect(() => {
    const element = targetElementRef.current
    if (!element || !enablePanning || !isZoomed) return

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true)
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      element.style.cursor = 'grabbing'
      e.preventDefault()
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }

      // Constrain pan to reasonable bounds
      const maxPan = 200
      newOffset.x = Math.max(-maxPan, Math.min(maxPan, newOffset.x))
      newOffset.y = Math.max(-maxPan, Math.min(maxPan, newOffset.y))

      setPanOffset(newOffset)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      element.style.cursor = enablePanning ? 'grab' : 'default'
    }

    const handleMouseLeave = () => {
      setIsDragging(false)
      element.style.cursor = enablePanning ? 'grab' : 'default'
    }

    element.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [enablePanning, isZoomed, isDragging, dragStart, panOffset])

  // Touch support for mobile panning
  React.useEffect(() => {
    const element = targetElementRef.current
    if (!element || !enablePanning || !isZoomed) return

    let touchStartPos = { x: 0, y: 0 }

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStartPos = {
        x: touch.clientX - panOffset.x,
        y: touch.clientY - panOffset.y
      }
      e.preventDefault()
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      const newOffset = {
        x: touch.clientX - touchStartPos.x,
        y: touch.clientY - touchStartPos.y
      }

      // Constrain pan to reasonable bounds
      const maxPan = 200
      newOffset.x = Math.max(-maxPan, Math.min(maxPan, newOffset.x))
      newOffset.y = Math.max(-maxPan, Math.min(maxPan, newOffset.y))

      setPanOffset(newOffset)
      e.preventDefault()
    }

    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchmove', handleTouchMove)

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, [enablePanning, isZoomed, panOffset])

  // Load saved zoom settings from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('accessibility-zoom')
      if (saved) {
        const { zoom, panning } = JSON.parse(saved)
        if (typeof zoom === 'number' && zoom >= 0.5 && zoom <= 3.0) {
          setZoomLevel(zoom)
        }
        if (typeof panning === 'boolean') {
          setEnablePanning(panning)
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Save zoom settings to localStorage
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

  const contextValue: ZoomContextValue = {
    zoomLevel,
    enablePanning,
    setZoomLevel,
    setEnablePanning,
    isZoomed,
    panOffset,
    setPanOffset,
    resetPan
  }

  return (
    <ZoomContext.Provider value={contextValue}>{children}</ZoomContext.Provider>
  )
}

/**
 * Hook to use zoom context
 */
export function useZoom() {
  const context = React.useContext(ZoomContext)
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider')
  }
  return context
}
