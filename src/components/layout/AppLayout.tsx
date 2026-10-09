import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { ChatBot } from '@/components/chat/ChatBot'
import { ChatPanelProvider } from '@/hooks/useChatPanel'

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    // ChatPanelProvider must wrap everything so any page can call openChat()
    <ChatPanelProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
            <div className="max-w-7xl mx-auto p-4 lg:p-6 animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />

        {/* Floating AI assistant — rendered once at app level */}
        <ChatBot />

        {/* Toast notifications */}
        <ToastContainer />
      </div>
    </ChatPanelProvider>
  )
}
