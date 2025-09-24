'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook for detecting when the browser tab becomes visible/hidden
 * Useful for auto-pausing games when users switch tabs
 */
export function useTabVisibility() {
  const [isVisible, setIsVisible] = useState<boolean>(true)

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof document === 'undefined') {
      return
    }

    // Initial state
    setIsVisible(!document.hidden)

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return isVisible
}
