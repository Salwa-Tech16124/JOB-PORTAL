import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-300 shadow-xs hover:shadow-sm overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground',
        solid:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5',
        secondary:
          'border-secondary/20 bg-secondary/10 text-secondary-foreground hover:bg-secondary hover:text-secondary-foreground',
        destructive:
          'border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white',
        outline:
          'text-foreground border-border/60 hover:bg-accent/50 hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
