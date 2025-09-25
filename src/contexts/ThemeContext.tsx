'use client'

/**
 * ThemeProvider context with React 19 patterns
 * Provides theme management and distribution throughout the app
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react'
import {
  ThemeMode,
  ThemeConfig,
  applyTheme,
  getTheme,
  resolveTheme,
  createSystemThemeListener,
  lightTheme
} from '@/lib/theme'
import {
  saveThemePreference,
  getDefaultTheme,
  isStorageAvailable
} from '@/lib/themeStorage'

export interface ThemeContextValue {
  // Current theme state
  mode: ThemeMode
  currentTheme: ThemeConfig
  resolvedTheme: string

  // Theme management functions
  setTheme: (mode: ThemeMode) => void

  // System integration
  systemTheme: 'light' | 'dark'
  isStorageEnabled: boolean

  // Loading state
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
  storageKey?: string
  enableSystem?: boolean
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')
  const [isLoading, setIsLoading] = useState(true)
  const [isStorageEnabled] = useState(() => isStorageAvailable())

  // Resolve current theme based on mode
  const resolvedTheme = resolveTheme(mode === 'system' ? systemTheme : mode)
  const currentTheme = getTheme(resolvedTheme) || lightTheme

  // Initialize theme on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Detect initial system theme
    const initialSystemTheme = window.matchMedia('(prefers-color-scheme: dark)')
      .matches
      ? 'dark'
      : 'light'
    setSystemTheme(initialSystemTheme)

    // Load saved theme preference
    if (isStorageEnabled) {
      const savedTheme = getDefaultTheme()
      setMode(savedTheme)
    }

    setIsLoading(false)
  }, [isStorageEnabled])

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem) return

    const cleanup = createSystemThemeListener((newSystemTheme) => {
      setSystemTheme(newSystemTheme)
    })

    return cleanup
  }, [enableSystem])

  // Apply theme whenever current theme changes
  useEffect(() => {
    if (isLoading) return

    applyTheme(currentTheme)
  }, [currentTheme, isLoading])

  // Theme setter with persistence
  const setTheme = useCallback(
    (newMode: ThemeMode) => {
      setMode(newMode)

      // Save to storage if available
      if (isStorageEnabled) {
        saveThemePreference(newMode)
      }
    },
    [isStorageEnabled]
  )

  const contextValue: ThemeContextValue = {
    mode,
    currentTheme,
    resolvedTheme,
    setTheme,
    systemTheme,
    isStorageEnabled,
    isLoading
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to access theme context
 * Must be used within ThemeProvider
 */
export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }

  return context
}
