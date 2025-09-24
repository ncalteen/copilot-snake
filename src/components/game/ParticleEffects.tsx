'use client'

import { ParticleEffect } from '@/lib/visualEffects'
import { cn } from '@/lib/utils'

interface ParticleEffectsProps {
  /** Array of active particle effects */
  particles: ParticleEffect[]
  /** Additional CSS classes */
  className?: string
}

/**
 * Particle Effects Overlay Component
 * Renders floating particle effects for game feedback
 */
export function ParticleEffects({
  particles,
  className
}: ParticleEffectsProps) {
  if (particles.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none z-10',
        'overflow-hidden',
        className
      )}
      aria-hidden="true">
      {particles.map((particle) => {
        const age = Date.now() - particle.startTime
        const progress = Math.min(age / particle.duration, 1)

        // Calculate animation properties
        const opacity = 1 - progress
        const scale =
          particle.type === 'score' ? 1 + progress * 0.2 : 1 - progress * 0.3
        const translateY = particle.type === 'score' ? -progress * 30 : 0

        const style = {
          left: `${particle.x}px`,
          top: `${particle.y}px`,
          opacity,
          transform: `translate(-50%, -50%) scale(${scale}) translateY(${translateY}px)`,
          color: particle.color,
          transition: 'none' // Smooth animation handled by transform
        }

        return (
          <div
            key={particle.id}
            className={cn(
              'absolute text-sm font-bold select-none',
              'animate-in fade-in duration-100',
              {
                'text-green-500': particle.type === 'food',
                'text-red-500': particle.type === 'collision',
                'text-yellow-500': particle.type === 'score'
              }
            )}
            style={style}>
            {particle.text || '✨'}
          </div>
        )
      })}
    </div>
  )
}
