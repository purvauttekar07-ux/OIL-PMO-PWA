import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import {
  MessageCircle, X, Send, RotateCcw, Sparkles,
  ChevronDown, Bot
} from 'lucide-react'
import { useChat, type ChatMessage, suggestionsForPage } from '@/hooks/useChat'
import { useChatPanel } from '@/hooks/useChatPanel'
import { useAppStore } from '@/store/useAppStore'
import clsx from 'clsx'

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []

  lines.forEach((line, i) => {
    if (line.trim() === '') {
      nodes.push(<div key={i} className="h-1.5" />)
      return
    }
    if (line.startsWith('```')) return

    function inlineFormat(raw: string, key: string | number): React.ReactNode {
      // **bold**
      const parts: React.ReactNode[] = []
      const boldRe = /\*\*(.+?)\*\*/g
      let last = 0; let m: RegExpExecArray | null
      while ((m = boldRe.exec(raw)) !== null) {
        if (m.index > last) parts.push(raw.slice(last, m.index))
        parts.push(<strong key={`b${m.index}`} className="font-semibold text-white">{m[1]}</strong>)
        last = m.index + m[0].length
      }
      if (last < raw.length) parts.push(raw.slice(last))
      // *italic*
      const result: React.ReactNode[] = []
      parts.forEach((p, pi) => {
        if (typeof p !== 'string') { result.push(p); return }
        const italicRe = /\*(.+?)\*/g
        let l2 = 0; let m2: RegExpExecArray | null
        while ((m2 = italicRe.exec(p)) !== null) {
          if (m2.index > l2) result.push(p.slice(l2, m2.index))
          result.push(<em key={`i${pi}_${m2.index}`} className="italic text-slate-300">{m2[1]}</em>)
          l2 = m2.index + m2[0].length
        }
        if (l2 < p.length) result.push(p.slice(l2))
      })
      return <span key={key}>{result}</span>
    }

    if (/^[•\-]\s/.test(line)) {
      nodes.push(
        <div key={i} className="flex gap-2 leading-snug">
          <span className="text-oil-400 mt-0.5 shrink-0">•</span>
          <span>{inlineFormat(line.slice(2).trim(), i)}</span>
        </div>
      )
      return
    }

    const numMatch = line.match(/^(\d+)\.\s(.+)/)
    if (numMatch) {
      nodes.push(
        <div key={i} className="flex gap-2 leading-snug">
          <span className="text-oil-400 font-mono shrink-0 w-4">{numMatch[1]}.</span>
          <span>{inlineFormat(numMatch[2], i)}</span>
        </div>
      )
      return
    }

    nodes.push(<p key={i} className="leading-snug">{inlineFormat(line, i)}</p>)
  })

  return nodes
}

// ─── Typing dots ──────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5" aria-label="Bot is typing">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: `${i * 0.18}s`, animationDuration: '0.9s' }}
        />
      ))}
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({
  message, onChipClick, isLast,
}: {
  message: ChatMessage
  onChipClick: (chip: string) => void
  isLast: boolean
}) {
  const isBot = message.sender === 'bot'
  return (
    <div className={clsx('flex gap-2 animate-slide-up', isBot ? 'items-start' : 'items-end justify-end')}>
      {isBot && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-oil-600 to-oil-800 flex items-center justify-center shrink-0 mt-0.5 shadow">
          <Bot size={13} className="text-white" />
        </div>
      )}

      <div className={clsx('flex flex-col gap-1.5 max-w-[85%]', !isBot && 'items-end')}>
        <div className={clsx(
          'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm',
          isBot ? 'bg-slate-700/80 text-slate-100 rounded-tl-sm' : 'bg-oil-600 text-white rounded-br-sm'
        )}>
          {message.isTyping
            ? <TypingDots />
            : <div className="space-y-0.5">{renderMarkdown(message.text)}</div>
          }
        </div>

        {!message.isTyping && (
          <p className={clsx('text-[10px] text-slate-600 px-1', !isBot && 'text-right')}>
            {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}

        {isBot && isLast && !message.isTyping && message.chips && message.chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {message.chips.map(chip => (
              <button
                key={chip}
                onClick={() => onChipClick(chip)}
                className="text-xs px-2.5 py-1 rounded-full border border-oil-500/40 text-oil-300 bg-oil-500/10 hover:bg-oil-500/20 hover:border-oil-400/60 active:scale-95 transition-all duration-150"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isBot && (
        <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold text-slate-200 shadow">
          U
        </div>
      )}
    </div>
  )
}

// ─── Main ChatBot ─────────────────────────────────────────────────────────────
export function ChatBot() {
  const { user, geminiApiKey } = useAppStore() as any
  const { pathname } = useLocation()
  const { register } = useChatPanel()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showScrollBtn, setShowScrollBtn] = useState(false)

  const {
    messages, inputValue, setInputValue,
    send, sendChip, reset,
    isOpen, open, toggle, close,
    unreadCount,
  } = useChat({ role: user.role, pathname, geminiApiKey })

  // Register the imperative open+seed callback so ChatTrigger can call it
  const openWithSeed = useCallback((seedQuestion?: string) => {
    open()
    if (seedQuestion) {
      // Small delay so the panel is visible before the message appears
      setTimeout(() => send(seedQuestion), 200)
    }
  }, [open, send])

  useEffect(() => {
    register(openWithSeed)
  }, [register, openWithSeed])

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80)
  }

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150)
  }, [isOpen])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const botIndices = messages
    .map((m, i) => m.sender === 'bot' ? i : -1)
    .filter(i => i >= 0)
  const lastBotIndex = botIndices.length > 0 ? botIndices[botIndices.length - 1] : -1

  return (
    <>
      {/* ── Chat Panel — Simple Sahayak (bottom-left) ─────────────────────── */}
      <div
        role="dialog"
        aria-label="OIL Sahayak"
        aria-modal="true"
        className={clsx(
          'fixed z-50 flex flex-col',
          'bottom-[4.5rem] left-2 right-2 max-h-[75dvh]',
          'sm:bottom-6 sm:left-6 sm:right-auto sm:w-[400px] sm:max-h-[600px]',
          'bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden',
          'transition-all duration-300 origin-bottom-left',
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto translate-y-0'
            : 'opacity-0 scale-95 pointer-events-none translate-y-4'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-800/80 border-b border-slate-700/50 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-oil-500 to-oil-700 flex items-center justify-center shadow">
            <Sparkles size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">Sahayak — Simple Help</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Ask in simple words — Hindi / English
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={reset}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
              title="New conversation"
              aria-label="Reset conversation"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={close}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700 transition-colors"
              aria-label="Close assistant"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Suggested Questions — Top Section */}
        <div className="px-3 py-2.5 bg-slate-800/50 border-b border-slate-700/40 shrink-0">
          <p className="text-[11px] font-bold text-oil-300 mb-1.5 flex items-center gap-1.5">
            <Sparkles size={11} /> Suggested — tap to ask
          </p>
          <div className="flex flex-wrap gap-1.5">
            {suggestionsForPage(pathname, user.role).map(q => (
              <button
                key={q}
                onClick={() => sendChip(q)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600/40 hover:bg-oil-500/20 hover:text-oil-300 hover:border-oil-500/30 active:scale-95 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-1.5">Or type your own doubt below — Sahayak replies in your language (Hindi/English)</p>
        </div>

        {/* Messages — Manual Questions Below */}
        <div
          className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scroll-smooth"
          onScroll={handleScroll}
          aria-live="polite"
          aria-label="Chat messages"
        >
          {messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onChipClick={sendChip}
              isLast={idx === lastBotIndex}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {showScrollBtn && (
          <button
            onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="absolute right-4 bottom-20 w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shadow-lg hover:bg-slate-600 transition-colors"
            aria-label="Scroll to latest message"
          >
            <ChevronDown size={16} className="text-slate-300" />
          </button>
        )}

        <div className="h-px bg-slate-700/50 shrink-0" />

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-3 bg-slate-900 shrink-0">
          <input
            ref={inputRef}
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask in simple words… e.g. SPI kya hai?"
            maxLength={300}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-oil-500/60 focus:ring-1 focus:ring-oil-500/20 transition-colors"
            aria-label="Type your question"
          />
          <button
            onClick={() => send()}
            disabled={!inputValue.trim()}
            className={clsx(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0',
              inputValue.trim()
                ? 'bg-oil-600 hover:bg-oil-500 text-white shadow-md active:scale-95'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-700 pb-2 shrink-0 select-none">
          Ask in English, Hindi, or Assamese
        </p>
      </div>

      {/* ── FAB — Bottom Left ──────────────────────────────────────────── */}
      <button
        onClick={toggle}
        aria-label={isOpen ? 'Close sahayak' : 'Open Sahayak Help'}
        aria-expanded={isOpen}
        className={clsx(
          'fixed z-50 flex items-center justify-center shadow-xl transition-all duration-300',
          'bottom-[4.75rem] left-4 sm:bottom-6 sm:left-6',
          'w-14 h-14 rounded-full active:scale-95',
          isOpen
            ? 'bg-slate-700 hover:bg-slate-600'
            : 'bg-gradient-to-br from-oil-500 to-oil-700 hover:from-oil-400 hover:to-oil-600'
        )}
      >
        {isOpen
          ? <X size={22} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }

        {!isOpen && unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="absolute inset-0 rounded-full bg-oil-500/40 animate-ping pointer-events-none" />
          </>
        )}
      </button>
    </>
  )
}
