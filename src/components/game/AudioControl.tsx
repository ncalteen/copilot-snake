'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AudioControlProps {
  /** Whether sound is enabled */
  soundEnabled: boolean
  /** Whether audio system is ready */
  isReady: boolean
  /** Whether audio is supported */
  isSupported: boolean
  /** Handler for toggling sound */
  onToggle: () => void
  /** Additional CSS classes */
  className?: string
}

/**
 * Audio Control Component
 * Simple toggle for enabling/disabling game audio
 */
export function AudioControl({
  soundEnabled,
  isReady,
  isSupported,
  onToggle,
  className
}: AudioControlProps) {
  if (!isSupported) {
    return null // Don't show if audio isn't supported
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className={cn(
        'flex items-center gap-2 text-muted-foreground hover:text-foreground',
        className
      )}
      aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
      title={soundEnabled ? 'Click to disable sound' : 'Click to enable sound'}>
      {soundEnabled ? (
        <Volume2 className="w-4 h-4" />
      ) : (
        <VolumeX className="w-4 h-4" />
      )}
      <span className="text-xs">
        {soundEnabled ? 'Sound On' : 'Sound Off'}
        {!isReady && soundEnabled && ' (Click to activate)'}
      </span>
    </Button>
  )
}
