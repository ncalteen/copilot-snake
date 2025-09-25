/**
 * useTheme hook for theme management
 * Provides convenient interface for theme operations and system preference detection
 */

import { useThemeContext } from '@/contexts/ThemeContext'
import { ThemeMode } from '@/lib/theme'

export interface UseThemeReturn {
  // Current theme state
  theme: string
  mode: ThemeMode
  systemTheme: 'light' | 'dark'
  resolvedTheme: string

  // Theme management
  setTheme: (theme: ThemeMode) => void

  // Utility functions
  isLight: boolean
  isDark: boolean
  isSystem: boolean

  // System integration
  isStorageEnabled: boolean
  isLoading: boolean

  // Convenience methods
  toggleTheme: () => void
  setLightTheme: () => void
  setDarkTheme: () => void
  setSystemTheme: () => void
}

/**
 * Hook for theme management with system preference detection
 */
export function useTheme(): UseThemeReturn {
  const context = useThemeContext()

  const {
    mode,
    resolvedTheme,
    setTheme,
    systemTheme,
    isStorageEnabled,
    isLoading
  } = context

  // Computed theme state
  const isLight = resolvedTheme === 'light'
  const isDark = resolvedTheme === 'dark'
  const isSystem = mode === 'system'

  // Convenience methods
  const toggleTheme = () => {
    if (mode === 'system') {
      // If currently system, toggle to the opposite of system preference
      setTheme(systemTheme === 'dark' ? 'light' : 'dark')
    } else {
      // Toggle between light and dark
      setTheme(mode === 'light' ? 'dark' : 'light')
    }
  }

  const setLightTheme = () => setTheme('light')
  const setDarkTheme = () => setTheme('dark')
  const setSystemTheme = () => setTheme('system')

  return {
    // Current theme state
    theme: resolvedTheme,
    mode,
    systemTheme,
    resolvedTheme,

    // Theme management
    setTheme,

    // Utility flags
    isLight,
    isDark,
    isSystem,

    // System integration
    isStorageEnabled,
    isLoading,

    // Convenience methods
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme
  }
}
