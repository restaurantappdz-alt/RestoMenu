import * as React from 'react'
import { cn } from '@/lib/utils'

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-zinc-800 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
})
Select.displayName = 'Select'

export { Select }
