import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Calendar, CheckSquare, Bell } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import clsx from 'clsx'

const TABS = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard', badge: null     },
  { to: '/field',     icon: ClipboardList,   label: 'DPR Entry',  badge: null    },
  { to: '/schedule',  icon: Calendar,        label: 'Schedule',   badge: null    },
  { to: '/approvals', icon: CheckSquare,     label: 'Approvals',  badge: 'approval' },
  { to: '/alerts',    icon: Bell,            label: 'Alerts',     badge: 'alert' },
]

export function BottomNav() {
  const { alerts, aiResults } = useAppStore()
  const unreadAlerts = alerts.filter(a => !a.isRead).length
  const pendingApprovals = aiResults.filter(r => r.status === 'needs_review').length

  function count(badge: string | null) {
    if (badge === 'alert') return unreadAlerts
    if (badge === 'approval') return pendingApprovals
    return 0
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur border-t border-slate-700/50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex">
        {TABS.map(({ to, icon: Icon, label, badge }) => {
          const n = count(badge)
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => clsx(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 relative transition-colors',
                isActive ? 'text-oil-400' : 'text-slate-500 hover:text-slate-300'
              )}
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    {n > 0 && (
                      <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                        {n > 9 ? '9+' : n}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-oil-500 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
