/**
 * useChatPanel
 * ------------
 * Thin context that lets any component imperatively open the chatbot
 * and optionally pre-seed a question into it.
 *
 * Usage:
 *   // anywhere in the tree:
 *   const { openChat } = useChatPanel()
 *   openChat('What is AI confidence?')
 */

import { createContext, useContext, useRef, useCallback } from 'react'
import React from 'react'

interface ChatPanelContextValue {
  /** Open the chat panel, optionally sending a pre-seeded message */
  openChat: (seedQuestion?: string) => void
  /** Register the open+seed callback from the ChatBot component */
  register: (fn: (q?: string) => void) => void
}

const ChatPanelContext = createContext<ChatPanelContextValue | null>(null)

export function ChatPanelProvider({ children }: { children: React.ReactNode }) {
  const fnRef = useRef<((q?: string) => void) | null>(null)

  const register = useCallback((fn: (q?: string) => void) => {
    fnRef.current = fn
  }, [])

  const openChat = useCallback((seedQuestion?: string) => {
    fnRef.current?.(seedQuestion)
  }, [])

  return React.createElement(
    ChatPanelContext.Provider,
    { value: { openChat, register } },
    children
  )
}

export function useChatPanel(): ChatPanelContextValue {
  const ctx = useContext(ChatPanelContext)
  if (!ctx) throw new Error('useChatPanel must be used within ChatPanelProvider')
  return ctx
}
