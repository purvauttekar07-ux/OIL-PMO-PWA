import clsx from 'clsx'

interface ProgressBarProps {
  planned?: number
  actual: number
  showLabels?: boolean
  height?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ProgressBar({ planned, actual, showLabels = true, height = 'md', className }: ProgressBarProps) {
  const variance = planned !== undefined ? actual - planned : null
  const isDelayed = variance !== null && variance < -5

  return (
    <div className={clsx('w-full', className)}>
      {showLabels && (
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span className="flex items-center gap-1.5">
            {planned !== undefined && (
              <><span className="w-2 h-2 rounded-sm bg-slate-500 inline-block" />Planned: <b className="text-slate-300">{planned}%</b></>
            )}
          </span>
          <span className="flex items-center gap-1.5">
            <span className={clsx('w-2 h-2 rounded-sm inline-block', isDelayed ? 'bg-red-400' : 'bg-oil-500')} />
            Actual: <b className={clsx(isDelayed ? 'text-red-400' : 'text-oil-400')}>{actual}%</b>
            {variance !== null && (
              <span className={clsx(
                'ml-1 font-medium',
                variance >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                ({variance >= 0 ? '+' : ''}{variance.toFixed(0)}%)
              </span>
            )}
          </span>
        </div>
      )}
      <div className={clsx(
        'relative w-full rounded-full bg-slate-700/60 overflow-hidden',
        height === 'sm' && 'h-1.5',
        height === 'md' && 'h-2.5',
        height === 'lg' && 'h-4',
      )}>
        {/* Planned marker */}
        {planned !== undefined && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-400/70 z-10"
            style={{ left: `${planned}%` }}
          />
        )}
        {/* Actual fill */}
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-700',
            isDelayed
              ? 'bg-gradient-to-r from-red-500 to-red-400'
              : actual >= (planned ?? 0)
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : 'bg-gradient-to-r from-oil-600 to-oil-400'
          )}
          style={{ width: `${Math.min(actual, 100)}%` }}
        />
      </div>
    </div>
  )
}
