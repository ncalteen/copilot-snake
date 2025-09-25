/**
 * Core theme system architecture with CSS custom properties
 * Supports dynamic theming with predefined theme configurations
 */

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeColors {
  background: string
  foreground: string
  card: string
  'card-foreground': string
  popover: string
  'popover-foreground': string
  primary: string
  'primary-foreground': string
  secondary: string
  'secondary-foreground': string
  muted: string
  'muted-foreground': string
  accent: string
  'accent-foreground': string
  destructive: string
  'destructive-foreground': string
  border: string
  input: string
  ring: string
}

export interface GameThemeColors {
  'snake-body': string
  'snake-head': string
  'food-normal': string
  'food-bonus': string
  'game-border': string
  'game-background': string
  'score-text': string
  'ui-accent': string
}

export interface ThemeConfig {
  name: string
  displayName: string
  mode: 'light' | 'dark'
  colors: ThemeColors
  gameColors: GameThemeColors
}

// Default light theme configuration
export const lightTheme: ThemeConfig = {
  name: 'light',
  displayName: 'Light',
  mode: 'light',
  colors: {
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.145 0 0)',
    card: 'oklch(1 0 0)',
    'card-foreground': 'oklch(0.145 0 0)',
    popover: 'oklch(1 0 0)',
    'popover-foreground': 'oklch(0.145 0 0)',
    primary: 'oklch(0.205 0 0)',
    'primary-foreground': 'oklch(0.985 0 0)',
    secondary: 'oklch(0.97 0 0)',
    'secondary-foreground': 'oklch(0.205 0 0)',
    muted: 'oklch(0.97 0 0)',
    'muted-foreground': 'oklch(0.556 0 0)',
    accent: 'oklch(0.97 0 0)',
    'accent-foreground': 'oklch(0.205 0 0)',
    destructive: 'oklch(0.577 0.245 27.325)',
    'destructive-foreground': 'oklch(0.985 0 0)',
    border: 'oklch(0.922 0 0)',
    input: 'oklch(0.922 0 0)',
    ring: 'oklch(0.708 0 0)'
  },
  gameColors: {
    'snake-body': 'oklch(0.488 0.243 264.376)',
    'snake-head': 'oklch(0.4 0.25 264.376)',
    'food-normal': 'oklch(0.646 0.222 41.116)',
    'food-bonus': 'oklch(0.577 0.245 27.325)',
    'game-border': 'oklch(0.708 0 0)',
    'game-background': 'oklch(0.99 0 0)',
    'score-text': 'oklch(0.205 0 0)',
    'ui-accent': 'oklch(0.488 0.243 264.376)'
  }
}

// Default dark theme configuration
export const darkTheme: ThemeConfig = {
  name: 'dark',
  displayName: 'Dark',
  mode: 'dark',
  colors: {
    background: 'oklch(0.145 0 0)',
    foreground: 'oklch(0.985 0 0)',
    card: 'oklch(0.205 0 0)',
    'card-foreground': 'oklch(0.985 0 0)',
    popover: 'oklch(0.205 0 0)',
    'popover-foreground': 'oklch(0.985 0 0)',
    primary: 'oklch(0.922 0 0)',
    'primary-foreground': 'oklch(0.205 0 0)',
    secondary: 'oklch(0.269 0 0)',
    'secondary-foreground': 'oklch(0.985 0 0)',
    muted: 'oklch(0.269 0 0)',
    'muted-foreground': 'oklch(0.708 0 0)',
    accent: 'oklch(0.269 0 0)',
    'accent-foreground': 'oklch(0.985 0 0)',
    destructive: 'oklch(0.704 0.191 22.216)',
    'destructive-foreground': 'oklch(0.145 0 0)',
    border: 'oklch(1 0 0 / 10%)',
    input: 'oklch(1 0 0 / 15%)',
    ring: 'oklch(0.556 0 0)'
  },
  gameColors: {
    'snake-body': 'oklch(0.488 0.243 264.376)',
    'snake-head': 'oklch(0.4 0.25 264.376)',
    'food-normal': 'oklch(0.696 0.17 162.48)',
    'food-bonus': 'oklch(0.704 0.191 22.216)',
    'game-border': 'oklch(0.556 0 0)',
    'game-background': 'oklch(0.18 0 0)',
    'score-text': 'oklch(0.985 0 0)',
    'ui-accent': 'oklch(0.488 0.243 264.376)'
  }
}

// Available themes registry
export const themes: Record<string, ThemeConfig> = {
  light: lightTheme,
  dark: darkTheme
}

/**
 * Apply theme CSS custom properties to the document
 */
export function applyTheme(theme: ThemeConfig): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Apply base theme colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })

  // Apply game-specific theme colors
  Object.entries(theme.gameColors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })

  // Update the theme class on document
  root.classList.remove('light', 'dark')
  root.classList.add(theme.mode)
}

/**
 * Get theme configuration by name
 */
export function getTheme(name: string): ThemeConfig | null {
  return themes[name] || null
}

/**
 * Get all available theme names
 */
export function getThemeNames(): string[] {
  return Object.keys(themes)
}

/**
 * Detect system theme preference
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Create media query listener for system theme changes
 */
export function createSystemThemeListener(
  callback: (theme: 'light' | 'dark') => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light')
  }

  mediaQuery.addEventListener('change', handleChange)

  return () => {
    mediaQuery.removeEventListener('change', handleChange)
  }
}

/**
 * Resolve theme mode to actual theme name
 */
export function resolveTheme(mode: ThemeMode): string {
  if (mode === 'system') {
    return getSystemTheme()
  }
  return mode
}
