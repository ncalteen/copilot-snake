'use client'

/**
 * Audio Manager for Snake Game
 * Handles sound effects and audio context management with Web Audio API
 */

export interface AudioSettings {
  /** Master volume (0-1) */
  masterVolume: number
  /** Sound effects enabled */
  soundEnabled: boolean
  /** Individual sound volumes */
  volumes: {
    food: number
    collision: number
    gameOver: number
    background: number
  }
}

export interface SoundEffects {
  /** Food consumption sound */
  eatFood: () => void
  /** Collision/game over sound */
  collision: () => void
  /** Game over jingle */
  gameOver: () => void
  /** Background music toggle */
  toggleBackground: (play: boolean) => void
}

/**
 * Default audio settings
 */
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  soundEnabled: true,
  volumes: {
    food: 0.8,
    collision: 0.9,
    gameOver: 0.8,
    background: 0.3
  }
}

/**
 * Audio frequencies and configurations for different sound effects
 */
const SOUND_CONFIG = {
  food: {
    frequency: 800,
    duration: 0.15,
    type: 'sine' as OscillatorType,
    attack: 0.01,
    decay: 0.14
  },
  collision: {
    frequency: 150,
    duration: 0.3,
    type: 'square' as OscillatorType,
    attack: 0.01,
    decay: 0.29
  },
  gameOver: {
    frequencies: [440, 349, 293, 246],
    duration: 0.5,
    type: 'sine' as OscillatorType,
    attack: 0.05,
    decay: 0.45
  }
} as const

/**
 * Audio Manager class for handling Web Audio API
 */
export class AudioManager {
  private audioContext: AudioContext | null = null
  private masterGainNode: GainNode | null = null
  private settings: AudioSettings
  private isInitialized = false

  constructor(settings: AudioSettings = DEFAULT_AUDIO_SETTINGS) {
    this.settings = { ...settings }
  }

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    try {
      // Create audio context
      const AudioContextClass =
        window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as unknown as any).webkitAudioContext
      this.audioContext = new AudioContextClass()

      // Create master gain node
      this.masterGainNode = this.audioContext.createGain()
      this.masterGainNode.connect(this.audioContext.destination)
      this.masterGainNode.gain.value = this.settings.masterVolume

      // Resume context if suspended (Chrome autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      this.isInitialized = true
      return true
    } catch (error) {
      console.warn('Failed to initialize audio context:', error)
      return false
    }
  }

  /**
   * Update audio settings
   */
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings }

    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.settings.masterVolume
    }
  }

  /**
   * Get current audio settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings }
  }

  /**
   * Play food consumption sound effect
   */
  playFoodSound(): void {
    if (!this.canPlaySound()) return

    this.playTone({
      ...SOUND_CONFIG.food,
      volume: this.settings.volumes.food
    })
  }

  /**
   * Play collision sound effect
   */
  playCollisionSound(): void {
    if (!this.canPlaySound()) return

    this.playTone({
      ...SOUND_CONFIG.collision,
      volume: this.settings.volumes.collision
    })
  }

  /**
   * Play game over sound sequence
   */
  playGameOverSound(): void {
    if (!this.canPlaySound()) return

    const { frequencies, duration, type, attack, decay } = SOUND_CONFIG.gameOver
    const noteDuration = duration / frequencies.length

    frequencies.forEach((frequency, index) => {
      setTimeout(
        () => {
          this.playTone({
            frequency,
            duration: noteDuration,
            type,
            attack,
            decay,
            volume: this.settings.volumes.gameOver
          })
        },
        index * noteDuration * 1000
      )
    })
  }

  /**
   * Create and play a tone with specified parameters
   */
  private playTone(config: {
    frequency: number
    duration: number
    type: OscillatorType
    attack: number
    decay: number
    volume: number
  }): void {
    if (!this.audioContext || !this.masterGainNode) return

    const { frequency, duration, type, attack, volume } = config
    const currentTime = this.audioContext.currentTime

    // Create oscillator and gain nodes
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(this.masterGainNode)

    // Configure oscillator
    oscillator.frequency.value = frequency
    oscillator.type = type

    // Configure envelope (ADSR)
    gainNode.gain.setValueAtTime(0, currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, currentTime + attack)
    gainNode.gain.linearRampToValueAtTime(0, currentTime + duration)

    // Start and stop oscillator
    oscillator.start(currentTime)
    oscillator.stop(currentTime + duration)
  }

  /**
   * Check if sound can be played
   */
  private canPlaySound(): boolean {
    return (
      this.isInitialized &&
      this.settings.soundEnabled &&
      this.audioContext !== null &&
      this.audioContext.state === 'running'
    )
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.masterGainNode = null
    this.isInitialized = false
  }
}

/**
 * Global audio manager instance
 */
let audioManagerInstance: AudioManager | null = null

/**
 * Get or create the global audio manager instance
 */
export function getAudioManager(settings?: AudioSettings): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager(settings)
  }
  return audioManagerInstance
}

/**
 * Initialize audio system (call after user interaction)
 */
export async function initializeAudio(
  settings?: AudioSettings
): Promise<boolean> {
  const manager = getAudioManager(settings)
  return await manager.initialize()
}

/**
 * Create sound effects interface
 */
export function createSoundEffects(audioManager: AudioManager): SoundEffects {
  return {
    eatFood: () => audioManager.playFoodSound(),
    collision: () => audioManager.playCollisionSound(),
    gameOver: () => audioManager.playGameOverSound(),
    toggleBackground: (play: boolean) => {
      // Background music can be implemented later
      console.log('Background music toggle:', play)
    }
  }
}
