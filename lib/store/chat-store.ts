import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import type { ChatMessage, InputMode, QueryResult, ChatHistory } from "@/lib/types"
import { processTextQuery, processVoiceQuery } from "@/lib/api"

interface ChatState {
  chatHistory: ChatHistory
  isProcessing: boolean
  inputMode: InputMode
  textInput: string
  sqlInput: string
  isRecording: boolean
  audioRecorder: MediaRecorder | null
  audioChunks: Blob[]
  recordingTime: number
  recordingInterval: number | null
  error: string | null

  setInputMode: (mode: InputMode) => void
  setTextInput: (text: string) => void
  setSqlInput: (sql: string) => void
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  cancelRecording: () => void
  processTextOrSqlQuery: (query: string, mode: "text" | "sql") => Promise<void>
  clearMessages: (mode?: InputMode) => void
  clearError: () => void

  // Helper function to get current messages based on input mode
  getCurrentMessages: () => ChatMessage[]
}

export const useChatStore = create<ChatState>()((set, get) => ({
  chatHistory: {
    voice: [],
    text: [],
    sql: [],
  },
  isProcessing: false,
  inputMode: "voice",
  textInput: "",
  sqlInput: "",
  isRecording: false,
  audioRecorder: null,
  audioChunks: [],
  recordingTime: 0,
  recordingInterval: null,
  error: null,

  setInputMode: (mode) => set({ inputMode: mode }),
  setTextInput: (text) => set({ textInput: text }),
  setSqlInput: (sql) => set({ sqlInput: sql }),

  getCurrentMessages: () => {
    const { chatHistory, inputMode } = get()
    return chatHistory[inputMode]
  },

  startRecording: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Create MediaRecorder with WebM format
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })

      // Set up event handlers
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          set((state) => ({ audioChunks: [...state.audioChunks, event.data] }))
        }
      }

      // Start recording
      recorder.start(100) // Collect data every 100ms

      // Set up timer
      const interval = window.setInterval(() => {
        set((state) => ({ recordingTime: state.recordingTime + 1 }))
      }, 1000)

      set({
        isRecording: true,
        audioRecorder: recorder,
        audioChunks: [],
        recordingTime: 0,
        recordingInterval: interval,
        error: null,
      })
    } catch (error) {
      console.error("Error starting recording:", error)
      set({ error: "Could not access microphone. Please check permissions." })
    }
  },

  stopRecording: async () => {
    const { audioRecorder, audioChunks, recordingInterval } = get()

    if (!audioRecorder) return

    return new Promise<void>((resolve) => {
      audioRecorder.onstop = async () => {
        try {
          // Clear interval
          if (recordingInterval) clearInterval(recordingInterval)

          // Convert audio chunks to blob
          const audioBlob = new Blob(audioChunks, { type: "audio/webm" })

          // Process the recording
          set({ isProcessing: true, error: null })

          // Add user message (placeholder until we get the transcription)
          const userMessage: ChatMessage = {
            id: uuidv4(),
            role: "user",
            content: "Voice recording...",
            type: "text",
            timestamp: Date.now(),
          }

          set((state) => ({
            chatHistory: {
              ...state.chatHistory,
              voice: [...state.chatHistory.voice, userMessage],
            },
          }))

          // Send to backend
          const result = await processVoiceQuery(audioBlob)

          if (result.success && result.data) {
            // Update user message with transcription if available
            if (result.data.transcription) {
              set((state) => ({
                chatHistory: {
                  ...state.chatHistory,
                  voice: state.chatHistory.voice.map((msg) =>
                    msg.id === userMessage.id ? { ...msg, content: result.data.transcription } : msg,
                  ),
                },
              }))
            }

            // Add SQL message if available
            if (result.data.sql) {
              const sqlMessage: ChatMessage = {
                id: uuidv4(),
                role: "assistant",
                content: result.data.sql,
                type: "sql",
                timestamp: Date.now(),
              }

              set((state) => ({
                chatHistory: {
                  ...state.chatHistory,
                  voice: [...state.chatHistory.voice, sqlMessage],
                },
              }))
            }

            // Add result message if available
            if (result.data.result) {
              

              const resultMessage: ChatMessage = {
                id: uuidv4(),
                role: "assistant",
                content: result.data.result,
                type: "result",
                timestamp: Date.now(),
              }

              set((state) => ({
                chatHistory: {
                  ...state.chatHistory,
                  voice: [...state.chatHistory.voice, resultMessage],
                },
              }))
            }
          } else {
            // Add error message
            const errorMessage: ChatMessage = {
              id: uuidv4(),
              role: "assistant",
              content: result.error || "Failed to process voice query",
              type: "error",
              timestamp: Date.now(),
            }

            set((state) => ({
              chatHistory: {
                ...state.chatHistory,
                voice: [...state.chatHistory.voice, errorMessage],
              },
            }))
          }
        } catch (error) {
          console.error("Error processing recording:", error)

          // Add error message
          const errorMessage: ChatMessage = {
            id: uuidv4(),
            role: "assistant",
            content: "Error processing voice recording",
            type: "error",
            timestamp: Date.now(),
          }

          set((state) => ({
            chatHistory: {
              ...state.chatHistory,
              voice: [...state.chatHistory.voice, errorMessage],
            },
          }))
        } finally {
          // Clean up
          set({
            isRecording: false,
            audioRecorder: null,
            audioChunks: [],
            recordingTime: 0,
            recordingInterval: null,
            isProcessing: false,
          })

          // Close audio tracks
          audioRecorder?.stream?.getTracks().forEach((track) => track.stop())

          resolve()
        }
      }

      // Stop the recorder (this will trigger onstop event)
      audioRecorder.stop()
    })
  },

  cancelRecording: () => {
    const { audioRecorder, recordingInterval } = get()

    if (audioRecorder) {
      audioRecorder.stop()
      audioRecorder.stream?.getTracks().forEach((track) => track.stop())
    }

    if (recordingInterval) {
      clearInterval(recordingInterval)
    }

    set({
      isRecording: false,
      audioRecorder: null,
      audioChunks: [],
      recordingTime: 0,
      recordingInterval: null,
    })
  },

  processTextOrSqlQuery: async (query, mode) => {
    if (!query.trim()) return

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: query,
      type: mode === "sql" ? "sql" : "text",
      timestamp: Date.now(),
    }

    set((state) => ({
      chatHistory: {
        ...state.chatHistory,
        [mode]: [...state.chatHistory[mode], userMessage],
      },
      isProcessing: true,
      error: null,
    }))

    try {
      if (mode === "text") {
        // Process text query
        const result = await processTextQuery(query)
        console.log("result", result);
        
        if (result.success && result.data) {
          // Add SQL message if available
          if (result.data.sql) {
            const sqlMessage: ChatMessage = {
              id: uuidv4(),
              role: "assistant",
              content: result.data.sql,
              type: "sql",
              timestamp: Date.now(),
            }

            set((state) => ({
              chatHistory: {
                ...state.chatHistory,
                text: [...state.chatHistory.text, sqlMessage],
              },
            }))
          }

          // Add result message if available
          if (result.data.result) {

            const resultMessage: ChatMessage = {
              id: uuidv4(),
              role: "assistant",
              content: result.data.result,
              type: "result",
              timestamp: Date.now(),
            }

            set((state) => ({
              chatHistory: {
                ...state.chatHistory,
                text: [...state.chatHistory.text, resultMessage],
              },
            }))
          }
        } else {
          // Add error message
          const errorMessage: ChatMessage = {
            id: uuidv4(),
            role: "assistant",
            content: result.error || "Failed to process query",
            type: "error",
            timestamp: Date.now(),
          }

          set((state) => ({
            chatHistory: {
              ...state.chatHistory,
              text: [...state.chatHistory.text, errorMessage],
            },
          }))
        }
      } else if (mode === "sql") {
        // For SQL mode, we'll just execute the SQL directly
        // In a real app, you would send this to your backend
        // For now, we'll simulate a response

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock result
        const resultData: QueryResult = {
          columns: ["id", "name", "email"],
          rows: [
            { id: 1, name: "John Doe", email: "john@example.com" },
            { id: 2, name: "Jane Smith", email: "jane@example.com" },
          ],
        }

        const resultMessage: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: JSON.stringify(resultData),
          type: "result",
          timestamp: Date.now(),
        }

        set((state) => ({
          chatHistory: {
            ...state.chatHistory,
            sql: [...state.chatHistory.sql, resultMessage],
          },
        }))
      }
    } catch (error) {
      console.error("Error processing query:", error)

      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: "assistant",
        content: "Error processing query",
        type: "error",
        timestamp: Date.now(),
      }

      set((state) => ({
        chatHistory: {
          ...state.chatHistory,
          [mode]: [...state.chatHistory[mode], errorMessage],
        },
      }))
    } finally {
      set({
        isProcessing: false,
        textInput: mode === "text" ? "" : get().textInput,
        sqlInput: mode === "sql" ? "" : get().sqlInput,
      })
    }
  },

  clearMessages: (mode) => {
    if (mode) {
      set((state) => ({
        chatHistory: {
          ...state.chatHistory,
          [mode]: [],
        },
      }))
    } else {
      set({
        chatHistory: {
          voice: [],
          text: [],
          sql: [],
        },
      })
    }
  },

  clearError: () => set({ error: null }),
}))

