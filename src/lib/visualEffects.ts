'use client'

/**
 * Visual Effects and Animation Utilities for Snake Game
 * Handles particle effects, score animations, and visual feedback
 */

export interface ParticleEffect {
  id: string
  x: number
  y: number
  type: 'food' | 'score' | 'collision'
  startTime: number
  duration: number
  color?: string
  text?: string
}

export interface VisualFeedback {
  /** Show food consumption effect */
  showFoodEffect: (x: number, y: number, score: number) => void
  /** Show collision effect */
  showCollisionEffect: (x: number, y: number) => void
  /** Show score popup */
  showScorePopup: (x: number, y: number, points: number) => void
  /** Show milestone celebration */
  showMilestone: (milestone: string) => void
}

/**
 * Visual effects configuration
 */
export const VISUAL_CONFIG = {
  particles: {
    food: {
      duration: 800,
      color: '#10b981', // green-500
      symbol: '+',
      count: 3
    },
    collision: {
      duration: 600,
      color: '#ef4444', // red-500
      symbol: '💥',
      count: 5
    },
    score: {
      duration: 1000,
      color: '#f59e0b', // amber-500
      symbol: '★',
      count: 1
    }
  },
  animations: {
    fadeIn: 'animate-fade-in',
    fadeOut: 'animate-fade-out',
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    slideUp: 'animate-slide-up'
  }
} as const

/**
 * Visual Effects Manager
 */
export class VisualEffectsManager {
  private particles: Map<string, ParticleEffect> = new Map()
  private nextId = 0
  private animationFrame: number | null = null

  constructor(
    private onParticleUpdate?: (particles: ParticleEffect[]) => void
  ) {
    this.startAnimationLoop()
  }

  /**
   * Add a particle effect
   */
  addParticle(effect: Omit<ParticleEffect, 'id' | 'startTime'>): string {
    const id = `particle-${this.nextId++}`
    const particle: ParticleEffect = {
      ...effect,
      id,
      startTime: Date.now()
    }

    this.particles.set(id, particle)
    this.notifyUpdate()
    return id
  }

  /**
   * Remove a particle effect
   */
  removeParticle(id: string): void {
    this.particles.delete(id)
    this.notifyUpdate()
  }

  /**
   * Get all active particles
   */
  getParticles(): ParticleEffect[] {
    return Array.from(this.particles.values())
  }

  /**
   * Clear all particles
   */
  clearParticles(): void {
    this.particles.clear()
    this.notifyUpdate()
  }

  /**
   * Start the animation loop
   */
  private startAnimationLoop(): void {
    const animate = () => {
      this.updateParticles()
      this.animationFrame = requestAnimationFrame(animate)
    }
    this.animationFrame = requestAnimationFrame(animate)
  }

  /**
   * Update particles and remove expired ones
   */
  private updateParticles(): void {
    const now = Date.now()
    let hasExpired = false

    for (const [id, particle] of this.particles) {
      if (now - particle.startTime >= particle.duration) {
        this.particles.delete(id)
        hasExpired = true
      }
    }

    if (hasExpired) {
      this.notifyUpdate()
    }
  }

  /**
   * Notify listeners of particle updates
   */
  private notifyUpdate(): void {
    if (this.onParticleUpdate) {
      this.onParticleUpdate(this.getParticles())
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    this.particles.clear()
  }
}

/**
 * Create visual feedback interface
 */
export function createVisualFeedback(
  effectsManager: VisualEffectsManager
): VisualFeedback {
  return {
    showFoodEffect: (x: number, y: number, score: number) => {
      const config = VISUAL_CONFIG.particles.food

      // Add multiple particles for food effect
      for (let i = 0; i < config.count; i++) {
        effectsManager.addParticle({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          type: 'food',
          duration: config.duration + Math.random() * 200,
          color: config.color,
          text: i === 0 ? `+${score}` : config.symbol
        })
      }
    },

    showCollisionEffect: (x: number, y: number) => {
      const config = VISUAL_CONFIG.particles.collision

      // Add collision particles
      for (let i = 0; i < config.count; i++) {
        effectsManager.addParticle({
          x: x + (Math.random() - 0.5) * 30,
          y: y + (Math.random() - 0.5) * 30,
          type: 'collision',
          duration: config.duration + Math.random() * 300,
          color: config.color,
          text: config.symbol
        })
      }
    },

    showScorePopup: (x: number, y: number, points: number) => {
      const config = VISUAL_CONFIG.particles.score

      effectsManager.addParticle({
        x,
        y: y - 20, // Float upward
        type: 'score',
        duration: config.duration,
        color: config.color,
        text: `+${points}`
      })
    },

    showMilestone: (milestone: string) => {
      // Milestone effects can be handled at the component level
      console.log('Milestone achieved:', milestone)
    }
  }
}

/**
 * CSS class utilities for animations
 */
export const animationClasses = {
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  slideUp: 'animate-in slide-in-from-bottom-4 duration-500',
  slideDown: 'animate-in slide-in-from-top-4 duration-500',
  scaleIn: 'animate-in zoom-in-95 duration-200',
  scaleOut: 'animate-out zoom-out-95 duration-200',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin'
} as const

/**
 * Score animation utilities
 */
export const scoreAnimations = {
  scoreIncrease: 'transition-all duration-300 scale-110 text-green-500',
  newHighScore: 'animate-pulse text-yellow-500 font-bold',
  gameOver: 'transition-all duration-500 scale-125 text-red-500'
} as const

/**
 * Game board animation utilities
 */
export const boardAnimations = {
  snakeHead: 'animate-pulse transition-colors duration-75',
  snakeBody: 'transition-colors duration-75',
  food: 'animate-bounce transition-colors duration-75',
  collision: 'animate-ping text-red-500'
} as const
