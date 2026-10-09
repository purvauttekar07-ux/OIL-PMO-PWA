import { useState, useCallback, useRef } from 'react'
import {
  findAnswer,
  FALLBACK_RESPONSE,
  GREETINGS_BY_ROLE,
  PAGE_CONTEXT_HINTS,
  KNOWLEDGE_BASE,
} from '@/lib/chatKnowledge'
import type { UserRole } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageSender = 'user' | 'bot'

export interface ChatMessage {
  id: string
  sender: MessageSender
  text: string
  timestamp: Date
  chips?: string[]        // quick-reply chips shown below a bot message
  isTyping?: boolean      // placeholder while bot "thinks"
}

interface UseChatOptions {
  role: UserRole
  pathname: string        // current page path for context hints
  geminiApiKey?: string
}

// ─── Page tag derived from route ─────────────────────────────────────────────

function pageTagFromPath(pathname: string): string {
  if (pathname === '/' || pathname === '') return 'dashboard'
  return pathname.replace('/', '')   // '/field' → 'field', '/approvals' → 'approvals'
}

// ─── Suggested questions shown when chat first opens ─────────────────────────

export function suggestionsForPage(pathname: string, role: UserRole): string[] {
  const base: Record<string, string[]> = {
    '/':          ['What is SPI?', 'What is the S-Curve?', 'What is Critical Path?'],
    '/field':     ['How do I fill DPR?', 'What is chainage?', 'What if I am offline?'],
    '/approvals': ['What is AI confidence?', 'How do I approve an entry?', 'What is the approval queue?'],
    '/schedule':  ['What is an activity?', 'What is WBS?', 'What is Critical Path?'],
    '/alerts':    ['What is an alert?', 'What is Critical Path?', 'Why "No Update" alert?'],
    '/projects':  ['What is SPI?', 'What is planned vs actual?', 'Who does what in this app?'],
    '/settings':  ['Who does what in this app?', 'What is AI confidence?'],
  }

  const roleExtra: Partial<Record<UserRole, string[]>> = {
    field_supervisor: ['What is chainage?', 'What if I am offline?', 'What is NDT?'],
    planner:          ['What is AI confidence?', 'How do I approve an entry?', 'What is WBS?'],
    pmo_manager:      ['What is SPI?', 'What is Critical Path?', 'What is the S-Curve?'],
  }

  const pageList = base[pathname] ?? base['/']!
  const roleList = roleExtra[role] ?? []

  // Merge, deduplicate, cap at 5
  return [...new Set([...pageList, ...roleList])].slice(0, 5)
}

// ─── Markdown-lite renderer (bold only — no external deps) ────────────────────
// The UI component will handle rendering **, bullet points, etc.

function uid() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// ─── Main hook ────────────────────────────────────────────────────────────────

export function useChat({ role, pathname, geminiApiKey }: UseChatOptions) {
  const greeting = GREETINGS_BY_ROLE[role] ?? GREETINGS_BY_ROLE['field_supervisor']!

  const callGeminiForHelp = useCallback(async (query: string, pageTag: string): Promise<string | null> => {
    if (!geminiApiKey) return null
    try {
      const prompt = `You are Sahayak, a simple help assistant for Nirman Setu software (Oil India infra project tracker). Answer in the SAME language the user used (if Hindi, reply Hindi-English mix; if English, reply English). Keep it VERY simple, no technical jargon, 3-5 lines max. Explain like to a 12-year-old. If user asks about DPR, SPI, chainage, WBS, etc., explain in plain words.\n\nContext: Current page is "${pageTag}" in Nirman Setu app.\nUser question: "${query}"\n\nReply in simple language:`
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3, maxOutputTokens: 300 } }),
      })
      if (!res.ok) return null
      const data = await res.json()
      const txt = data.candidates?.[0]?.content?.parts?.[0]?.text
      return txt || null
    } catch { return null }
  }, [geminiApiKey])

  const initialMessages: ChatMessage[] = [
    {
      id: uid(),
      sender: 'bot',
      text: greeting,
      timestamp: new Date(),
      chips: suggestionsForPage(pathname, role),
    },
  ]

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [hasBeenOpened, setHasBeenOpened] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Open / close ─────────────────────────────────────────────────────────

  const open = useCallback(() => {
    setIsOpen(true)
    setHasBeenOpened(true)
    setUnreadCount(0)
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) {
        setHasBeenOpened(true)
        setUnreadCount(0)
      }
      return !prev
    })
  }, [])

  // ── Add a message ─────────────────────────────────────────────────────────

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [
      ...prev,
      { ...msg, id: uid(), timestamp: new Date() },
    ])
  }, [])

  // ── Bot reply logic ───────────────────────────────────────────────────────

  const botReply = useCallback((query: string) => {
    const pageTag = pageTagFromPath(pathname)

    // Show typing indicator
    const typingId = uid()
    setMessages(prev => [
      ...prev,
      { id: typingId, sender: 'bot', text: '', timestamp: new Date(), isTyping: true },
    ])

    typingTimerRef.current = setTimeout(async () => {
      setMessages(prev => prev.filter(m => m.id !== typingId))
      const lowerQuery = query.toLowerCase().trim()

      if (/^(hi|hello|hey|namaste|namaskar|help|start|helo)[\s!?]*$/.test(lowerQuery)) {
        setMessages(prev => [...prev, { id: uid(), sender: 'bot', text: greeting, timestamp: new Date(), chips: suggestionsForPage(pathname, role) }])
        if (!isOpen) setUnreadCount(c => c + 1); return
      }
      if (/(what can you|capabilities|what do you know|menu|options|topics|list)/.test(lowerQuery)) {
        const topics = KNOWLEDGE_BASE.map(e => `• ${e.question}`).join('\n')
        setMessages(prev => [...prev, { id: uid(), sender: 'bot', text: `📚 **Here are all the topics I can help with:**\n\n${topics}\n\nJust ask any of these, or type a term you're confused about!`, timestamp: new Date(), chips: ['What is DPR?', 'What is SPI?', 'What is Critical Path?'] }])
        if (!isOpen) setUnreadCount(c => c + 1); return
      }
      if (/(here|this page|this screen|current page|help here|kya karna hai yahan)/.test(lowerQuery)) {
        const hint = PAGE_CONTEXT_HINTS[pathname] ?? PAGE_CONTEXT_HINTS['/']!
        setMessages(prev => [...prev, { id: uid(), sender: 'bot', text: hint, timestamp: new Date(), chips: suggestionsForPage(pathname, role) }])
        if (!isOpen) setUnreadCount(c => c + 1); return
      }

      const entry = findAnswer(query, pageTag)
      if (entry) {
        let text = entry.answer
        if (entry.hindiHint) text += `\n\n💬 *Hindi: ${entry.hindiHint}*`
        setMessages(prev => [...prev, { id: uid(), sender: 'bot', text, timestamp: new Date(), chips: entry.followUps }])
        if (!isOpen) setUnreadCount(c => c + 1); return
      }

      const geminiAns = await callGeminiForHelp(query, pageTag)
      if (geminiAns) {
        setMessages(prev => [...prev, { id: uid(), sender: 'bot', text: geminiAns, timestamp: new Date(), chips: suggestionsForPage(pathname, role) }])
        if (!isOpen) setUnreadCount(c => c + 1); return
      }

      setMessages(prev => [...prev, { id: uid(), sender: 'bot', text: FALLBACK_RESPONSE, timestamp: new Date(), chips: suggestionsForPage(pathname, role) }])
      if (!isOpen) setUnreadCount(c => c + 1)
    }, 750 + Math.random() * 400)
  }, [pathname, role, greeting, isOpen, callGeminiForHelp])

  // ── Send a message (from input or chip tap) ───────────────────────────────

  const send = useCallback((text?: string) => {
    const msg = (text ?? inputValue).trim()
    if (!msg) return

    addMessage({ sender: 'user', text: msg })
    setInputValue('')
    botReply(msg)
  }, [inputValue, addMessage, botReply])

  // ── Quick-reply chip handler ──────────────────────────────────────────────

  const sendChip = useCallback((chip: string) => {
    send(chip)
  }, [send])

  // ── Reset conversation ────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setMessages([
      {
        id: uid(),
        sender: 'bot',
        text: greeting,
        timestamp: new Date(),
        chips: suggestionsForPage(pathname, role),
      },
    ])
    setInputValue('')
  }, [greeting, pathname, role])

  return {
    messages,
    inputValue,
    setInputValue,
    send,
    sendChip,
    reset,
    isOpen,
    open,
    close,
    toggle,
    unreadCount,
    hasBeenOpened,
  }
}
