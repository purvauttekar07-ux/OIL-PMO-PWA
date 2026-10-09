import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Calendar, CheckSquare,
  Bell, Settings, X, ChevronRight, Layers, Sliders, ShieldAlert,
  BookOpen, HelpCircle, MessageCircle
} from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useChatPanel } from '@/hooks/useChatPanel'
import clsx from 'clsx'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'PMO Dashboard', badge: null },
  { to: '/field', icon: ClipboardList, label: 'Field Capture & Agent', badge: null },
  { to: '/schedule', icon: Calendar, label: 'Multi-Discipline Schedule', badge: null },
  { to: '/approvals', icon: CheckSquare, label: 'Planner Queue (HITL)', badge: 'approval' },
  { to: '/institutional-memory', icon: BookOpen, label: 'Institutional Memory', badge: null },
  { to: '/simulation', icon: Sliders, label: 'What-If CPM Simulation', badge: null },
  { to: '/anomalies', icon: ShieldAlert, label: 'AI Anomaly Center', badge: 'anomaly' },
  { to: '/alerts', icon: Bell, label: 'Alerts', badge: 'alert' },
  { to: '/projects', icon: Layers, label: 'All Projects', badge: null },
  { to: '/settings', icon: Settings, label: 'Settings', badge: null },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { alerts, aiResults, anomalies, unmatchedActivities } = useAppStore()
  const { open: openChat } = useChatPanel() as any
  const unreadAlerts = alerts.filter(a => !a.isRead).length
  const pendingApprovals =
    aiResults.filter(r => r.status === 'needs_review').length +
    unmatchedActivities.filter(u => u.status === 'pending_review').length
  const activeAnomalies = anomalies.filter(a => a.status === 'active').length

  function getBadge(badge: string | null): number {
    if (badge === 'alert') return unreadAlerts
    if (badge === 'approval') return pendingApprovals
    if (badge === 'anomaly') return activeAnomalies
    return 0
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-700/60 z-50 flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-slate-700/60 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-oil-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
              NS
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Nirman Setu</p>
              <p className="text-[10px] text-oil-400 font-semibold leading-tight">Oil India Limited</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sahayak — simple help, always visible */}
        <div className="px-3 py-2">
          <button
            onClick={() => { onClose(); openChat?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-oil-600 to-oil-700 text-white text-xs font-bold shadow-md hover:from-oil-500 hover:to-oil-600 active:scale-[0.98] transition-all"
          >
            <MessageCircle size={16} className="shrink-0" />
            <span className="flex-1 text-left">Sahayak — Ask Doubt</span>
            <HelpCircle size={13} className="opacity-80" />
          </button>
          <p className="text-[10px] text-slate-500 text-center mt-1">Simple answers — Hindi / English</p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label, badge }) => {
            const count = getBadge(badge)
            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={onClose}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                  isActive
                    ? 'bg-oil-600 text-white shadow-md shadow-oil-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {count > 0 && (
                  <span className={clsx(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center',
                    badge === 'anomaly' ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-black'
                  )}>
                    {count}
                  </span>
                )}
                <ChevronRight size={13} className="opacity-0 group-hover:opacity-60 transition-opacity" />
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700/60 bg-slate-900/50">
          <div className="p-2 bg-slate-800/60 rounded-xl border border-slate-700/40 text-[10px] text-slate-400 text-center">
            <p className="font-bold text-slate-200">SIH 2026 · PS SIH26122</p>
            <p className="text-slate-500 mt-0.5">Team CodeCrafters</p>
          </div>
        </div>
      </aside>
    </>
  )
}
