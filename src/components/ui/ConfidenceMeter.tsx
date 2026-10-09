import clsx from 'clsx'

interface ConfidenceMeterProps {
  value: number  // 0-1
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function ConfidenceMeter({ value, showLabel = true, size = 'md' }: ConfidenceMeterProps) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'emerald' : pct >= 60 ? 'amber' : 'red'
  const label = pct >= 80 ? 'High Confidence' : pct >= 60 ? 'Medium – Review' : 'Low – Manual Required'

  const colorMap = {
    emerald: { bar: 'bg-emerald-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/30' },
    amber: { bar: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', ring: 'ring-amber-500/30' },
    red: { bar: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10', ring: 'ring-red-500/30' },
  }

  const c = colorMap[color]

  return (
    <div className={clsx('flex flex-col gap-1', size === 'sm' && 'text-xs')}>
      <div className="flex items-center justify-between">
        <span className={clsx('font-bold', c.text, size === 'sm' ? 'text-base' : 'text-xl')}>{pct}%</span>
        {showLabel && (
          <span className={clsx('text-xs px-2 py-0.5 rounded-full ring-1', c.bg, c.text, c.ring)}>
            {label}
          </span>
        )}
      </div>
      <div className="w-full h-2 rounded-full bg-slate-700">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', c.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
