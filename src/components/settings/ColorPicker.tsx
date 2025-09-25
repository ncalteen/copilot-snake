'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  validateColor,
  hexToRGB,
  rgbToHSL,
  hslToRGB,
  rgbToHex,
  type HSLColor
} from '@/lib/colorUtils'
import { ColorPreview } from './ColorPreview'
import { type ColorPreset } from '@/lib/colorPresets'

/**
 * ColorPicker component props
 */
export interface ColorPickerProps {
  /** Current color value */
  value: string
  /** Callback when color changes */
  onChange: (color: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Whether the picker is disabled */
  disabled?: boolean
  /** Additional CSS class */
  className?: string
  /** Trigger button variant */
  variant?: 'default' | 'outline' | 'ghost'
  /** Size of the trigger button */
  size?: 'sm' | 'default' | 'lg'
  /** Whether to show presets */
  showPresets?: boolean
  /** Background color for contrast preview */
  previewBackground?: string
  /** Label for accessibility */
  label?: string
}

/**
 * Custom color picker component using shadcn primitives
 */
export function ColorPicker({
  value,
  onChange,
  placeholder = 'Select color',
  disabled = false,
  className,
  variant = 'outline',
  size = 'default',
  showPresets = true,
  previewBackground = '#ffffff',
  label
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)
  const [activeTab, setActiveTab] = React.useState<'picker' | 'presets'>(
    'picker'
  )
  const [hslValues, setHslValues] = React.useState<HSLColor>({
    h: 0,
    s: 0,
    l: 0
  })

  // Update HSL values when color changes
  React.useEffect(() => {
    const rgb = hexToRGB(value)
    if (rgb) {
      const hsl = rgbToHSL(rgb)
      setHslValues(hsl)
    }
    setInputValue(value)
  }, [value])

  const handleColorChange = (newColor: string) => {
    const validation = validateColor(newColor)
    if (validation.valid && validation.normalizedValue) {
      onChange(validation.normalizedValue)
      setInputValue(validation.normalizedValue)
    }
  }

  const handleHSLChange = (newHsl: Partial<HSLColor>) => {
    const updatedHsl = { ...hslValues, ...newHsl }
    setHslValues(updatedHsl)

    const rgb = hslToRGB(updatedHsl)
    const hex = rgbToHex(rgb)
    handleColorChange(hex)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    if (newValue.trim()) {
      handleColorChange(newValue)
    }
  }

  const handlePresetSelect = (preset: ColorPreset) => {
    handleColorChange(preset.colors.primary)
    setIsOpen(false)
  }

  const isValidColor = validateColor(inputValue).valid

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={disabled}
            className="justify-start text-left font-normal">
            <div className="flex items-center space-x-2">
              <div
                className="h-4 w-4 rounded border border-border"
                style={{
                  backgroundColor: isValidColor ? value : '#ccc'
                }}
              />
              <span className="flex-1 truncate">{value || placeholder}</span>
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Color</DialogTitle>
            <DialogDescription>
              Select a color using the picker or enter a custom value.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Tab navigation */}
            <div className="flex space-x-1 rounded-lg bg-muted p-1">
              <button
                onClick={() => setActiveTab('picker')}
                className={cn(
                  'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  activeTab === 'picker'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}>
                Custom
              </button>
              {showPresets && (
                <button
                  onClick={() => setActiveTab('presets')}
                  className={cn(
                    'flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    activeTab === 'presets'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}>
                  Presets
                </button>
              )}
            </div>

            {/* Custom picker tab */}
            {activeTab === 'picker' && (
              <div className="space-y-4">
                {/* Color input */}
                <div className="space-y-2">
                  <label htmlFor="color-input" className="text-sm font-medium">
                    Color Value
                  </label>
                  <input
                    id="color-input"
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="#000000 or rgb(0,0,0)"
                    aria-describedby="color-input-error"
                  />
                  {!isValidColor && inputValue && (
                    <p
                      id="color-input-error"
                      className="text-xs text-destructive">
                      Please enter a valid color format
                    </p>
                  )}
                </div>

                {/* HSL sliders */}
                {isValidColor && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Hue: {hslValues.h}°
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="359"
                        value={hslValues.h}
                        onChange={(e) =>
                          handleHSLChange({ h: parseInt(e.target.value) })
                        }
                        aria-label="Adjust hue value"
                        className="w-full"
                        style={{
                          background: `linear-gradient(to right, 
                            hsl(0, ${hslValues.s}%, ${hslValues.l}%),
                            hsl(60, ${hslValues.s}%, ${hslValues.l}%),
                            hsl(120, ${hslValues.s}%, ${hslValues.l}%),
                            hsl(180, ${hslValues.s}%, ${hslValues.l}%),
                            hsl(240, ${hslValues.s}%, ${hslValues.l}%),
                            hsl(300, ${hslValues.s}%, ${hslValues.l}%),
                            hsl(360, ${hslValues.s}%, ${hslValues.l}%)
                          )`
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Saturation: {hslValues.s}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={hslValues.s}
                        onChange={(e) =>
                          handleHSLChange({ s: parseInt(e.target.value) })
                        }
                        aria-label="Adjust saturation value"
                        className="w-full"
                        style={{
                          background: `linear-gradient(to right, 
                            hsl(${hslValues.h}, 0%, ${hslValues.l}%),
                            hsl(${hslValues.h}, 100%, ${hslValues.l}%)
                          )`
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Lightness: {hslValues.l}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={hslValues.l}
                        onChange={(e) =>
                          handleHSLChange({ l: parseInt(e.target.value) })
                        }
                        aria-label="Adjust lightness value"
                        className="w-full"
                        style={{
                          background: `linear-gradient(to right, 
                            hsl(${hslValues.h}, ${hslValues.s}%, 0%),
                            hsl(${hslValues.h}, ${hslValues.s}%, 50%),
                            hsl(${hslValues.h}, ${hslValues.s}%, 100%)
                          )`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Color preview */}
                {isValidColor && (
                  <ColorPreview
                    primaryColor={value}
                    backgroundColor={previewBackground}
                    size="sm"
                    variant="text"
                    showAccessibilityInfo={true}
                  />
                )}
              </div>
            )}

            {/* Presets tab */}
            {activeTab === 'presets' && showPresets && (
              <PresetGrid onSelect={handlePresetSelect} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Preset color grid component
 */
function PresetGrid({ onSelect }: { onSelect: (preset: ColorPreset) => void }) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all')
  const [presets, setPresets] = React.useState<ColorPreset[]>([])

  React.useEffect(() => {
    // Import presets dynamically to avoid circular dependencies
    import('@/lib/colorPresets')
      .then(({ ALL_PRESETS, getPresetsByTag }) => {
        if (selectedCategory === 'all') {
          setPresets(ALL_PRESETS.slice(0, 12)) // Limit for UI space
        } else {
          setPresets(getPresetsByTag(selectedCategory))
        }
      })
      .catch((error) => {
        console.error('Failed to load color presets:', error)
        setPresets([]) // Fallback to empty array
      })
  }, [selectedCategory])

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'high-contrast', name: 'High Contrast' },
    { id: 'colorblind-friendly', name: 'Colorblind Friendly' },
    { id: 'dark', name: 'Dark Themes' }
  ]

  return (
    <div className="space-y-3">
      {/* Category selector */}
      <div className="flex flex-wrap gap-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium transition-colors',
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}>
            {category.name}
          </button>
        ))}
      </div>

      {/* Preset grid */}
      <div className="grid grid-cols-3 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className="group relative rounded-lg border border-border p-2 text-left transition-colors hover:bg-muted/50">
            <div className="mb-2 flex space-x-1">
              <div
                className="h-4 w-4 rounded-sm border border-border"
                style={{ backgroundColor: preset.colors.primary }}
              />
              <div
                className="h-4 w-4 rounded-sm border border-border"
                style={{ backgroundColor: preset.colors.background }}
              />
              {preset.colors.secondary && (
                <div
                  className="h-4 w-4 rounded-sm border border-border"
                  style={{ backgroundColor: preset.colors.secondary }}
                />
              )}
            </div>
            <h4 className="text-xs font-medium">{preset.name}</h4>
            <p className="text-xs text-muted-foreground">
              {preset.wcagLevel}
              {preset.colorblindFriendly && ' • CB'}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Simple color input with validation
 */
export function ColorInput({
  value,
  onChange,
  placeholder = '#000000',
  className,
  ...props
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [inputValue, setInputValue] = React.useState(value)
  const [isValid, setIsValid] = React.useState(true)

  React.useEffect(() => {
    setInputValue(value)
    setIsValid(validateColor(value).valid)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    const validation = validateColor(newValue)
    setIsValid(validation.valid)

    if (validation.valid && validation.normalizedValue) {
      onChange(validation.normalizedValue)
    }
  }

  return (
    <div className="relative">
      <input
        {...props}
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'flex h-9 w-full rounded-md border bg-background px-3 py-1 pl-10 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
          isValid
            ? 'border-input'
            : 'border-destructive focus-visible:ring-destructive',
          className
        )}
      />
      <div
        className="absolute left-2 top-1/2 h-5 w-5 -translate-y-1/2 rounded border border-border"
        style={{
          backgroundColor: isValid ? value : '#ccc'
        }}
      />
      {!isValid && inputValue && (
        <p className="mt-1 text-xs text-destructive">Invalid color format</p>
      )}
    </div>
  )
}
