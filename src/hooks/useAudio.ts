'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  AudioManager,
  AudioSettings,
  SoundEffects,
  DEFAULT_AUDIO_SETTINGS,
  getAudioManager,
  createSoundEffects
} from '@/lib/audio'

/**
 * Audio hook return type
 */
interface UseAudioReturn {
  /** Current audio settings */
  settings: AudioSettings
  /** Sound effects interface */
  sounds: SoundEffects
  /** Whether audio is initialized and ready */
  isReady: boolean
  /** Whether audio is supported */
  isSupported: boolean
  /** Initialize audio (call after user interaction) */
  initialize: () => Promise<boolean>
  /** Update audio settings */
  updateSettings: (settings: Partial<AudioSettings>) => void
  /** Toggle master sound on/off */
  toggleSound: () => void
  /** Set master volume */
  setVolume: (volume: number) => void
}

/**
 * Local storage key for audio settings
 */
const AUDIO_SETTINGS_KEY = 'snake-game-audio-settings'

/**
 * Load audio settings from localStorage
 */
function loadAudioSettings(): AudioSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_AUDIO_SETTINGS
  }

  try {
    const stored = localStorage.getItem(AUDIO_SETTINGS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_AUDIO_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.warn('Failed to load audio settings:', error)
  }

  return DEFAULT_AUDIO_SETTINGS
}

/**
 * Save audio settings to localStorage
 */
function saveAudioSettings(settings: AudioSettings): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.warn('Failed to save audio settings:', error)
  }
}

/**
 * Custom hook for managing game audio
 */
export function useAudio(): UseAudioReturn {
  const [settings, setSettings] = useState<AudioSettings>(loadAudioSettings)
  const [isReady, setIsReady] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  const audioManagerRef = useRef<AudioManager | null>(null)
  const soundsRef = useRef<SoundEffects | null>(null)

  /**
   * Initialize audio manager and sound effects
   */
  const initialize = useCallback(async (): Promise<boolean> => {
    if (audioManagerRef.current && isReady) {
      return true
    }

    try {
      // Check for Web Audio API support
      if (
        !window.AudioContext &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !(window as unknown as any).webkitAudioContext
      ) {
        setIsSupported(false)
        return false
      }

      // Get or create audio manager
      audioManagerRef.current = getAudioManager(settings)

      // Initialize audio context
      const success = await audioManagerRef.current.initialize()

      if (success) {
        // Create sound effects interface
        soundsRef.current = createSoundEffects(audioManagerRef.current)
        setIsReady(true)
        return true
      } else {
        setIsSupported(false)
        return false
      }
    } catch (error) {
      console.warn('Audio initialization failed:', error)
      setIsSupported(false)
      return false
    }
  }, [settings, isReady])

  /**
   * Update audio settings
   */
  const updateSettings = useCallback(
    (newSettings: Partial<AudioSettings>) => {
      const updatedSettings = { ...settings, ...newSettings }
      setSettings(updatedSettings)
      saveAudioSettings(updatedSettings)

      if (audioManagerRef.current) {
        audioManagerRef.current.updateSettings(newSettings)
      }
    },
    [settings]
  )

  /**
   * Toggle sound on/off
   */
  const toggleSound = useCallback(() => {
    updateSettings({ soundEnabled: !settings.soundEnabled })
  }, [settings.soundEnabled, updateSettings])

  /**
   * Set master volume
   */
  const setVolume = useCallback(
    (volume: number) => {
      const clampedVolume = Math.max(0, Math.min(1, volume))
      updateSettings({ masterVolume: clampedVolume })
    },
    [updateSettings]
  )

  /**
   * Default sound effects that work even when audio is not ready
   */
  const safeSounds: SoundEffects = {
    eatFood: () => soundsRef.current?.eatFood(),
    collision: () => soundsRef.current?.collision(),
    gameOver: () => soundsRef.current?.gameOver(),
    toggleBackground: (play: boolean) =>
      soundsRef.current?.toggleBackground(play)
  }

  /**
   * Auto-initialize audio on first user interaction (if enabled)
   */
  useEffect(() => {
    if (!isReady && settings.soundEnabled) {
      const handleFirstInteraction = () => {
        initialize()
        // Remove listeners after first interaction
        document.removeEventListener('click', handleFirstInteraction)
        document.removeEventListener('keydown', handleFirstInteraction)
        document.removeEventListener('touchstart', handleFirstInteraction)
      }

      document.addEventListener('click', handleFirstInteraction)
      document.addEventListener('keydown', handleFirstInteraction)
      document.addEventListener('touchstart', handleFirstInteraction)

      return () => {
        document.removeEventListener('click', handleFirstInteraction)
        document.removeEventListener('keydown', handleFirstInteraction)
        document.removeEventListener('touchstart', handleFirstInteraction)
      }
    }
  }, [isReady, settings.soundEnabled, initialize])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (audioManagerRef.current) {
        audioManagerRef.current.dispose()
      }
    }
  }, [])

  return {
    settings,
    sounds: safeSounds,
    isReady,
    isSupported,
    initialize,
    updateSettings,
    toggleSound,
    setVolume
  }
}

/**
 * Hook for game event audio
 * Provides convenient methods for common game audio events
 */
export function useGameAudio() {
  const audio = useAudio()

  const playFoodSound = useCallback(() => {
    audio.sounds.eatFood()
  }, [audio.sounds])

  const playCollisionSound = useCallback(() => {
    audio.sounds.collision()
  }, [audio.sounds])

  const playGameOverSound = useCallback(() => {
    audio.sounds.gameOver()
  }, [audio.sounds])

  return {
    ...audio,
    playFoodSound,
    playCollisionSound,
    playGameOverSound
  }
}
