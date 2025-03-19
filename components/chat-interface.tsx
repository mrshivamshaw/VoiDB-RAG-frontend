"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, LogOut, Mic, Play, Send, Settings, User, StopCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ChatMessages from "@/components/chat-messages"
import { useAuthStore } from "@/lib/store/auth-store"
import { useChatStore } from "@/lib/store/chat-store"
import type { InputMode } from "@/lib/types"

interface ChatInterfaceProps {
  isConfigured: boolean
  onOpenConfig: () => void
  onLogout: () => void
}

export default function ChatInterface({ isConfigured, onOpenConfig, onLogout }: ChatInterfaceProps) {
  const { user } = useAuthStore()
  const {
    getCurrentMessages,
    isProcessing,
    inputMode,
    textInput,
    sqlInput,
    isRecording,
    recordingTime,
    error,
    setInputMode,
    setTextInput,
    setSqlInput,
    startRecording,
    stopRecording,
    cancelRecording,
    processTextOrSqlQuery,
    clearMessages,
    clearError,
  } = useChatStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentMessages = getCurrentMessages()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentMessages])

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleToggleRecording = async () => {
    if (isRecording) {
      await stopRecording()
    } else {
      await startRecording()
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (textInput.trim() && !isProcessing) {
      processTextOrSqlQuery(textInput, "text")
    }
  }

  const handleSqlSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (sqlInput.trim() && !isProcessing) {
      processTextOrSqlQuery(sqlInput, "sql")
    }
  }

  const handleTabChange = (value: string) => {
    setInputMode(value as InputMode)
  }

  const handleClearChat = () => {
    clearMessages(inputMode)
  }

  if (!isConfigured) {
    return (
      <div className="flex-1 flex flex-col h-full">
        <header className="p-6 border-b border-[#2a2a2a] flex justify-between items-center">
          <h1 className="text-3xl font-bold">Voice Database Assistant</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onOpenConfig} className="text-gray-400 hover:text-white">
              <Settings size={20} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-[#2a2a2a]">
                  <User size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-[#2a2a2a] border-[#3a3a3a]">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-gray-300">{user?.username}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <Alert className="max-w-md bg-yellow-900/20 border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              Please configure your database settings to get started. Click the settings icon in the top right.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <header className="p-6 border-b border-[#2a2a2a] flex justify-between items-center">
        <h1 className="text-3xl font-bold">Voice Database Assistant</h1>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onOpenConfig} className="text-gray-400 hover:text-white">
            <Settings size={20} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full bg-[#2a2a2a]">
                <User size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-[#2a2a2a] border-[#3a3a3a]">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-gray-300">{user?.username}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Tabs value={inputMode} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        <div className="border-b border-[#2a2a2a] flex justify-between items-center">
          <TabsList className="bg-transparent border-b border-[#2a2a2a] rounded-none h-auto p-0">
            <TabsTrigger
              value="voice"
              className={`px-6 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none ${inputMode === "voice" ? "text-primary" : "text-gray-400"}`}
            >
              Voice Interaction
            </TabsTrigger>
            <TabsTrigger
              value="text"
              className={`px-6 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none ${inputMode === "text" ? "text-primary" : "text-gray-400"}`}
            >
              Text Interaction
            </TabsTrigger>
            <TabsTrigger
              value="sql"
              className={`px-6 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none ${inputMode === "sql" ? "text-primary" : "text-gray-400"}`}
            >
              Database Explorer
            </TabsTrigger>
          </TabsList>

          {currentMessages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearChat} className="mr-4 text-gray-400 hover:text-white">
              <Trash2 size={16} className="mr-1" />
              Clear Chat
            </Button>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <ChatMessages messages={currentMessages} />
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-[#2a2a2a] p-4">
            {error && (
              <Alert className="mb-4 bg-red-900/20 border-red-800">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="flex justify-between items-center">
                  <span>{error}</span>
                  <Button variant="ghost" size="sm" onClick={clearError} className="h-6 px-2">
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <TabsContent value="voice" className="m-0">
              {isRecording && (
                <div className="mb-4 p-3 bg-[#2a2a2a] rounded-md flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-3 animate-pulse"></div>
                    <span>Recording... {formatTime(recordingTime)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelRecording}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <div className="flex justify-center">
                <Button
                  onClick={handleToggleRecording}
                  disabled={isProcessing}
                  className={`rounded-full w-16 h-16 ${isRecording ? "bg-red-600 hover:bg-red-700" : "bg-primary hover:bg-primary/90"}`}
                >
                  {isRecording ? <StopCircle size={24} /> : <Mic size={24} />}
                </Button>
              </div>
              {isRecording && (
                <p className="text-center mt-4 text-sm text-gray-400">
                  Click the button again to stop recording and process your query
                </p>
              )}
            </TabsContent>

            <TabsContent value="text" className="m-0">
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ask a question about your database..."
                  className="flex-1 bg-[#2a2a2a] border-[#3a3a3a]"
                  disabled={isProcessing}
                />
                <Button
                  type="submit"
                  disabled={isProcessing || !textInput.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send size={18} />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="sql" className="m-0">
              <form onSubmit={handleSqlSubmit} className="space-y-3">
                <Textarea
                  value={sqlInput}
                  onChange={(e) => setSqlInput(e.target.value)}
                  placeholder="Enter SQL query..."
                  className="min-h-[100px] bg-[#2a2a2a] border-[#3a3a3a] font-mono"
                  disabled={isProcessing}
                />
                <Button
                  type="submit"
                  disabled={isProcessing || !sqlInput.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Play size={18} className="mr-2" />
                  Execute Query
                </Button>
              </form>
            </TabsContent>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

