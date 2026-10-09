/**
 * ChatTrigger
 * -----------
 * A small inline banner or pill that opens the chatbot pre-seeded
 * with a specific question or hint.  Place it anywhere in the UI
 * next to a confusing term, form field, or workflow step.
 *
 * Props:
 *   question  — text sent directly to the bot when the user clicks
 *   label     — button/pill label (defaults to question)
 *   variant   — 'pill' (inline chip) | 'banner' (full-width info strip)
 *   onOpen    — called so parent can open+seed the chat panel
 */

import { HelpCircle, MessageCircle, Sparkles } from 'lucide-react'
import clsx from 'clsx'

interface ChatTriggerProps {
  question: string
  label?: string
  variant?: 'pill' | 'banner' | 'icon'
  onOpen: (question: string) => void
  className?: string
}

export function ChatTrigger({
  question,
  label,
  variant = 'pill',
  onOpen,
  className,
}: ChatTriggerProps) {
  const text = label ?? question

  if (variant === 'icon') {
    return (
      <button
        onClick={() => onOpen(question)}
        title={`Ask assistant: "${question}"`}
        aria-label={`Ask assistant: "${question}"`}
        className={clsx(
          'inline-flex items-center justify-center w-5 h-5 rounded-full',
          'text-slate-500 hover:text-oil-400 hover:bg-oil-500/10 transition-colors',
          className
        )}
      >
        <HelpCircle size={14} />
      </button>
    )
  }

  if (variant === 'banner') {
    return (
      <button
        onClick={() => onOpen(question)}
        className={clsx(
          'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
          'bg-oil-500/10 border border-oil-500/20 hover:bg-oil-500/15 hover:border-oil-500/30',
          'text-left transition-all duration-150 group',
          className
        )}
      >
        <Sparkles size={16} className="text-oil-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-oil-300">Confused? Ask the AI Assistant</p>
          <p className="text-[11px] text-oil-400/70 truncate mt-0.5">"{text}"</p>
        </div>
        <MessageCircle
          size={15}
          className="text-oil-500 group-hover:text-oil-400 transition-colors shrink-0"
        />
      </button>
    )
  }

  // default: pill
  return (
    <button
      onClick={() => onOpen(question)}
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
        'text-[11px] font-medium border transition-all duration-150',
        'border-oil-500/30 text-oil-400 bg-oil-500/10',
        'hover:bg-oil-500/20 hover:border-oil-400/50 active:scale-95',
        className
      )}
    >
      <HelpCircle size={11} />
      {text}
    </button>
  )
}
