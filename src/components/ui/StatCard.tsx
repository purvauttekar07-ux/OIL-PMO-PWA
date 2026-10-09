import clsx from 'clsx'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'default' | 'success' | 'warning' | 'danger' | 'orange'
  className?: string
}

export function StatCard({ label, value, sub, icon, trend, trendValue, color = 'default', className }: StatCardProps) {
  const colorMap = {
    default: 'text-white',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    orange: 'text-oil-400',
  }

  return (
    <div className={clsx(
      'bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2',
      className
    )}>
      <div className="flex items-start justify-between">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        {icon && (
          <div className="p-1.5 rounded-lg bg-slate-700/50">
            {icon}
          </div>
        )}
      </div>
      <p className={clsx('text-2xl font-bold', colorMap[color])}>{value}</p>
      {(sub || trend) && (
        <div className="flex items-center gap-2">
          {trendValue && (
            <span className={clsx(
              'text-xs font-medium flex items-center gap-0.5',
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </span>
          )}
          {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
      )}
    </div>
  )
}
