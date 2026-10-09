import clsx from 'clsx'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variant === 'default' && 'bg-slate-700 text-slate-200',
      variant === 'success' && 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30',
      variant === 'warning' && 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30',
      variant === 'danger' && 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30',
      variant === 'info' && 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30',
      variant === 'outline' && 'border border-slate-600 text-slate-400',
      className
    )}>
      {children}
    </span>
  )
}
