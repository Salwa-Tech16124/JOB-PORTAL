'use client'

import * as React from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'glass-card bg-card/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-4 group/calendar [--cell-size:36px]',
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: cn(
          'flex gap-5 flex-col md:flex-row relative',
          defaultClassNames.months
        ),
        month: cn('flex flex-col w-full gap-5', defaultClassNames.month),
        nav: cn(
          'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-8 rounded-lg p-0',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-8 rounded-lg p-0',
          defaultClassNames.button_next
        ),
        month_caption: cn(
          'flex items-center justify-center h-8 w-full px-[var(--cell-size)]',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'w-full flex items-center justify-center h-8 gap-2',
          defaultClassNames.dropdowns
        ),
        table: 'w-full border-collapse',
        weekdays: cn('flex mb-2', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground text-xs flex-1 text-center',
          defaultClassNames.weekday
        ),
        week: cn('flex w-full mt-2 gap-1', defaultClassNames.week),
        day: cn(
          'relative aspect-square w-full',
          defaultClassNames.day
        ),
        today: cn(
          'bg-accent text-accent-foreground rounded-xl',
          defaultClassNames.today
        ),
        outside: cn(
          'text-muted-foreground/40',
          defaultClassNames.outside
        ),
        disabled: cn(
          'opacity-50',
          defaultClassNames.disabled
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === 'left')
            return <ChevronLeftIcon className="size-4" {...props} />
          if (orientation === 'right')
            return <ChevronRightIcon className="size-4" {...props} />
          return <ChevronDownIcon className="size-4" {...props} />
        },
        DayButton: CalendarDayButton,
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        'rounded-xl hover:bg-primary/20',
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }