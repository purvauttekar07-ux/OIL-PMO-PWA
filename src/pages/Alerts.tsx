import { AlertTriangle, Info, Zap, CheckCircle2, Bell, Clock } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/hooks/useToast'
import type { Alert } from '@/types'
import clsx from 'clsx'
import { useState } from 'react'

function AlertCard({ alert, onRead }: { alert: Alert; onRead: (id: string) => void }) {
  const { projects, activities } = useAppStore()
  const project = projects.find(p => p.id === alert.projectId)
  const activity = alert.activityId ? activities.find(a => a.id === alert.activityId) : null

  const config = {
    critical: {
      icon: <AlertTriangle size={18} />,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
      badge: 'danger' as const,
    },
    warning: {
      icon: <AlertTriangle size={18} />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      badge: 'warning' as const,
    },
    info: {
      icon: <Info size={18} />,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      badge: 'info' as const,
    },
  }[alert.severity]

  const typeLabel: Record<Alert['type'], string> = {
    delay: 'Schedule Delay',
    critical_path: 'Critical Path',
    spi_low: 'SPI Alert',
    no_update: 'No Update',
    approval_needed: 'Approval Needed',
    milestone: 'Milestone',
    anomaly: 'ML Anomaly',
  }

  return (
    <div className={clsx(
      'rounded-xl border p-4 transition-all',
      config.bg,
      alert.isRead && 'opacity-60'
    )}>
      <div className="flex items-start gap-3">
        <div className={clsx('shrink-0 mt-0.5', config.color)}>{config.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={clsx('text-sm font-semibold', config.color)}>{alert.title}</p>
              {!alert.isRead && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant={config.badge} size="sm">{alert.severity.toUpperCase()}</Badge>
              <Badge variant="outline" size="sm">{typeLabel[alert.type]}</Badge>
            </div>
          </div>
          <p className="text-sm text-slate-300 mb-2">{alert.message}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {project && <span>📍 {project.name}</span>}
            {activity && <span>🔧 {activity.activityId}: {activity.name}</span>}
            {alert.daysImpact > 0 && (
              <span className={clsx('font-medium flex items-center gap-1', config.color)}>
                <Clock size={11} /> {alert.daysImpact} day impact
              </span>
            )}
            <span>{new Date(alert.createdAt).toLocaleString('en-IN')}</span>
          </div>
          {!alert.isRead && (
            <Button
              size="xs"
              variant="ghost"
              className="mt-2"
              onClick={() => onRead(alert.id)}
              icon={<CheckCircle2 size={12} />}
            >
              Mark as read
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function Alerts() {
  const { alerts, markAlertRead } = useAppStore()
  const { toast } = useToast()
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('unread')

  const unread = alerts.filter(a => !a.isRead)
  const critical = alerts.filter(a => a.severity === 'critical')

  const filtered = alerts.filter(a => {
    if (filter === 'unread') return !a.isRead
    if (filter === 'critical') return a.severity === 'critical'
    return true
  })

  function markAllRead() {
    unread.forEach(a => markAlertRead(a.id))
    if (unread.length > 0) toast({ type: 'success', title: 'All alerts marked as read', duration: 3000 })
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Alerts & Notifications</h1>
          <p className="text-sm text-slate-400 mt-0.5">Real-time delay detection and escalation alerts</p>
        </div>
        {unread.length > 0 && (
          <Button size="sm" variant="outline" onClick={markAllRead} icon={<CheckCircle2 size={14} />}>
            Mark All Read
          </Button>
        )}
      </div>

      {/* Alert stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-400">{critical.length}</p>
          <p className="text-xs text-red-500">Critical</p>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">{unread.length}</p>
          <p className="text-xs text-amber-500">Unread</p>
        </div>
        <div className="bg-slate-700/30 border border-slate-700/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-slate-300">{alerts.length}</p>
          <p className="text-xs text-slate-500">Total</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-1.5">
        {(['unread', 'critical', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1.5 text-xs rounded-lg border transition-all',
              filter === f
                ? 'border-oil-500/60 bg-oil-500/10 text-oil-300'
                : 'border-slate-700 text-slate-500 hover:text-slate-300'
            )}
          >
            {f === 'unread' ? `Unread (${unread.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell size={32} className="text-emerald-500 mb-3" />
          <p className="text-base font-semibold text-slate-300">All clear!</p>
          <p className="text-sm text-slate-500">No alerts in this category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => (
            <AlertCard key={alert.id} alert={alert} onRead={markAlertRead} />
          ))}
        </div>
      )}
    </div>
  )
}
