"use client"
import ChatInterface from "@/components/chat-interface"
import ConfigPanel from "@/components/config-panel"
import LoginPage from "@/components/login-page"
import { useAuthStore } from "@/lib/store/auth-store"
import { useDbConfigStore } from "@/lib/store/db-config-store"
import { useUIStore } from "@/lib/store/ui-store"
import { useChatStore } from "@/lib/store/chat-store"

export default function Home() {
  const { isLoggedIn, logout } = useAuthStore()
  const { isConfigured, resetConfiguration } = useDbConfigStore()
  const { configPanelOpen, closeConfigPanel, openConfigPanel } = useUIStore()
  const { clearMessages } = useChatStore()

  // Handle logout - reset configuration and clear messages
  const handleLogout = () => {
    logout()
    resetConfiguration()
    clearMessages()
  }

  if (!localStorage.getItem('token') || !isLoggedIn) {
    return <LoginPage />
  }

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden">
      <ConfigPanel isOpen={configPanelOpen} onClose={closeConfigPanel} />

      <ChatInterface isConfigured={isConfigured} onOpenConfig={openConfigPanel} onLogout={handleLogout} />
    </div>
  )
}

