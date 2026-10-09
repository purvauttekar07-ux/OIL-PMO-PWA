import { useState } from 'react'
import { Bell, Wifi, WifiOff, Sun, Moon, Menu, Radio, Sparkles, Sliders } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { NotificationDrawer } from './NotificationDrawer'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { alerts, isOnline, pendingSyncCount, darkMode, toggleDarkMode, user, geminiApiKey } = useAppStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  const unreadAlerts = alerts.filter(a => !a.isRead).length
  const hasCritical = alerts.some(a => !a.isRead && a.severity === 'critical')

  return (
    <>
      <header className="h-14 bg-slate-900/95 backdrop-blur border-b border-slate-700/60 flex items-center px-4 gap-3 sticky top-0 z-40">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo Branding */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-oil-600 to-oil-500 flex items-center justify-center shadow-md shadow-oil-600/30">
            <Radio size={16} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-white leading-tight">Nirman Setu</p>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-oil-500/20 text-oil-300 rounded border border-oil-500/40">
                OIL PMO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">AI Schedule-Linking Layer</p>
          </div>
        </div>

        <div className="flex-1" />

        {/* LLM Status Indicator */}
        <div
          onClick={() => navigate('/settings')}
          className={clsx(
            'hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all border',
            geminiApiKey
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          )}
        >
          <Sparkles size={12} className={geminiApiKey ? 'text-emerald-400 animate-spin-slow' : 'text-slate-400'} />
          <span>{geminiApiKey ? 'Gemini LLM Active' : 'Offline Matcher'}</span>
        </div>

        {/* Online / Sync Status */}
        <div className={clsx(
          'hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors',
          isOnline
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        )}>
          {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
          {pendingSyncCount > 0 && (
            <span className="bg-amber-500 text-black text-[10px] font-bold px-1.5 rounded-full">
              {pendingSyncCount}
            </span>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setDrawerOpen(o => !o)}
          className={clsx(
            'relative p-1.5 rounded-lg transition-colors',
            drawerOpen
              ? 'bg-slate-800 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          )}
          aria-label="Notifications"
        >
          <Bell
            size={18}
            className={clsx(hasCritical && !drawerOpen && 'animate-pulse text-red-400')}
          />
          {unreadAlerts > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              {unreadAlerts > 9 ? '9+' : unreadAlerts}
            </span>
          )}
        </button>

        {/* Active User Avatar & Role */}
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 pl-1 cursor-pointer"
          title={`${user.name} (${user.role})`}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-oil-500 to-oil-700 flex items-center justify-center text-xs font-bold text-white shadow-md">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
      </header>

      {/* Notification Drawer */}
      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
