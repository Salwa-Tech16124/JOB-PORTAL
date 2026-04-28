import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
const alertVariants = cva(
  'glass relative w-full rounded-xl border px-5 py-4 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-4 gap-y-1 items-start [&>svg]:size-5 [&>svg]:translate-y-0.5 [&>svg]:text-current shadow-xs transition-colors duration-300',
  {
    variants: {
      variant: {
        default: 'bg-card/40 text-card-foreground border-border/60 hover:bg-card/60',
        destructive:
          'text-destructive border-destructive/30 bg-destructive/5 hover:bg-destructive/10 [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive/90',
        success:
          'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400',
        warning:
          'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        'col-start-2 line-clamp-1 min-h-5 font-semibold tracking-tight text-base',
        className,
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-muted-foreground/90 col-start-2 grid justify-items-start gap-1 text-[13px] leading-relaxed [&_p]:leading-relaxed',
        className,
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription }
