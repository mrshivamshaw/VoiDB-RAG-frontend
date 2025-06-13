"use client"
import { useEffect, useState } from "react"
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

  const [isClient, setIsClient] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  // Run this only on client after mount
  useEffect(() => {
    setIsClient(true)
    const token = localStorage.getItem("token")
    setHasToken(!!token)
  }, [])

  const handleLogout = () => {
    logout()
    resetConfiguration()
    clearMessages()
  }

  if (!isClient) {
    return null // or loading skeleton
  }

  if (!hasToken || !isLoggedIn) {
    return <LoginPage />
  }

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white overflow-hidden">
      <ConfigPanel isOpen={configPanelOpen} onClose={closeConfigPanel} />
      <ChatInterface
        isConfigured={isConfigured}
        onOpenConfig={openConfigPanel}
        onLogout={handleLogout}
      />
    </div>
  )
}
