'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

interface DialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Dialog({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  children
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false
  )
  const open = controlledOpen ?? uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setUncontrolledOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    },
    [controlledOpen, onOpenChange]
  )

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({
  children,
  asChild = false,
  ...props
}: {
  children: React.ReactNode
  asChild?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error('DialogTrigger must be used within a Dialog')

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.onOpenChange(true)
    props.onClick?.(e)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{
        onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
      }>,
      { onClick: handleClick }
    )
  }

  return (
    <button {...props} onClick={handleClick}>
      {children}
    </button>
  )
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function DialogContent({ children, className, ...props }: DialogContentProps) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error('DialogContent must be used within a Dialog')

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        context.onOpenChange(false)
      }
    }

    if (context.open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [context])

  if (!context.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => context.onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        className={cn(
          'relative z-50 w-full max-w-lg mx-4 bg-background border border-border rounded-lg shadow-lg',
          'animate-in fade-in-0 zoom-in-95 duration-300',
          className
        )}
        role="dialog"
        aria-modal="true"
        {...props}>
        {children}
      </div>
    </div>
  )
}

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-2',
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
}

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-2',
        className
      )}
      {...props}
    />
  )
}

function DialogClose({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error('DialogClose must be used within a Dialog')

  return (
    <button
      className={cn(
        'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none',
        className
      )}
      onClick={() => context.onOpenChange(false)}
      {...props}>
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
}
