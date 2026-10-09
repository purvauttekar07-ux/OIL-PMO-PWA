import { X, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react'
import { useToast, type ToastType } from '@/hooks/useToast'
import clsx from 'clsx'

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={17} className="text-emerald-400 shrink-0" />,
  error:   <XCircle     size={17} className="text-red-400 shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
  info:    <Info        size={17} className="text-blue-400 shrink-0" />,
}

const STYLES: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error:   'border-red-500/30 bg-red-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  info:    'border-blue-500/30 bg-blue-500/10',
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed top-16 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]"
    >
      {toasts.map(t => (
        <div
          key={t.id}
          role="alert"
          className={clsx(
            'flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md',
            'animate-slide-up transition-all duration-200',
            STYLES[t.type]
          )}
        >
          {ICONS[t.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">{t.title}</p>
            {t.message && (
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">{t.message}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="p-0.5 rounded text-slate-500 hover:text-slate-300 transition-colors shrink-0"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
