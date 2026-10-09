import { X, AlertTriangle, Info, Bell, CheckCircle2, Clock, ExternalLink } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import type { Alert } from '@/types'

interface NotificationDrawerProps {
  open: boolean
  onClose: () => void
}

function AlertItem({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const { markAlertRead } = useAppStore()
  const navigate = useNavigate()

  const config = {
    critical: { icon: <AlertTriangle size={15} />, color: 'text-red-400', dot: 'bg-red-500' },
    warning:  { icon: <AlertTriangle size={15} />, color: 'text-amber-400', dot: 'bg-amber-500' },
    info:     { icon: <Info size={15} />,          color: 'text-blue-400',  dot: 'bg-blue-500' },
  }[alert.severity]

  function handleClick() {
    markAlertRead(alert.id)
    if (alert.type === 'approval_needed') {
      navigate('/approvals')
    } else if (alert.type === 'delay' || alert.type === 'critical_path' || alert.type === 'spi_low') {
      navigate('/')
    } else {
      navigate('/alerts')
    }
    onClose()
  }

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'w-full text-left p-3.5 rounded-xl border transition-all duration-150 group',
        alert.isRead
          ? 'border-slate-700/40 hover:border-slate-600'
          : alert.severity === 'critical'
            ? 'border-red-500/25 bg-red-500/5 hover:bg-red-500/8'
            : alert.severity === 'warning'
              ? 'border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/8'
              : 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/8'
      )}
    >
      <div className="flex items-start gap-2.5">
        {/* Unread dot + icon */}
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <div className={clsx('shrink-0', config.color)}>{config.icon}</div>
          {!alert.isRead && (
            <span className={clsx('w-1.5 h-1.5 rounded-full', config.dot)} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={clsx(
            'text-xs font-semibold leading-tight',
            alert.isRead ? 'text-slate-400' : 'text-white'
          )}>
            {alert.title}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
            {alert.message}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {alert.daysImpact > 0 && (
              <span className={clsx('text-[10px] font-medium flex items-center gap-0.5', config.color)}>
                <Clock size={9} /> {alert.daysImpact}d impact
              </span>
            )}
            <span className="text-[10px] text-slate-600">
              {new Date(alert.createdAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
            </span>
          </div>
        </div>
        <ExternalLink size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0 mt-0.5" />
      </div>
    </button>
  )
}

export function NotificationDrawer({ open, onClose }: NotificationDrawerProps) {
  const { alerts, markAlertRead } = useAppStore()
  const navigate = useNavigate()

  const sorted = [...alerts].sort((a, b) => {
    // Unread first, then by severity, then by date
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
    const sev = { critical: 0, warning: 1, info: 2 }
    if (sev[a.severity] !== sev[b.severity]) return sev[a.severity] - sev[b.severity]
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const unreadCount = alerts.filter(a => !a.isRead).length
  const criticalCount = alerts.filter(a => !a.isRead && a.severity === 'critical').length

  function markAllRead() {
    alerts.filter(a => !a.isRead).forEach(a => markAlertRead(a.id))
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-label="Notifications"
        aria-modal="true"
        className={clsx(
          'fixed top-14 right-0 sm:right-4 w-full sm:w-96 max-h-[calc(100dvh-4rem)]',
          'bg-slate-900 border border-slate-700/60 sm:rounded-2xl shadow-2xl z-50',
          'flex flex-col transition-all duration-200 origin-top-right',
          open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-700/50 shrink-0">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-slate-300" />
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="danger" size="sm">{unreadCount} new</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition-colors"
              aria-label="Close notifications"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Critical banner */}
        {criticalCount > 0 && (
          <div className="mx-3 mt-3 px-3 py-2.5 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center gap-2 shrink-0">
            <AlertTriangle size={14} className="text-red-400 shrink-0" />
            <p className="text-xs text-red-300 font-medium">
              {criticalCount} critical alert{criticalCount > 1 ? 's' : ''} require immediate attention
            </p>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 size={28} className="text-emerald-500 mb-2" />
              <p className="text-sm font-semibold text-slate-300">All clear</p>
              <p className="text-xs text-slate-500 mt-0.5">No notifications right now</p>
            </div>
          ) : (
            sorted.map(alert => (
              <AlertItem key={alert.id} alert={alert} onClose={onClose} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700/50 shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-center"
            onClick={() => { navigate('/alerts'); onClose() }}
          >
            View all alerts →
          </Button>
        </div>
      </div>
    </>
  )
}
