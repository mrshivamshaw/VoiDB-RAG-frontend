// API client for interacting with the backend
import type { DatabaseConfig } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function loginUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.detail || "Login failed" }
    }
    localStorage.setItem('token', (await response.json())?.access_token);
    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "Network error. Please try again." }
  }
}

export async function signupUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.detail || "Signup failed" }
    }

    return { success: true }
  } catch (error) {
    console.error("Signup error:", error)
    return { success: false, error: "Network error. Please try again." }
  }
}

export async function saveDbConfig(dbConfig: DatabaseConfig): Promise<{ success: boolean; error?: string }> {
  try {
    const token = localStorage.getItem('token');
    const payload = {
      db_type: dbConfig.type,
      host: dbConfig.host,
      port: Number.parseInt(dbConfig.port),
      username: dbConfig.user,
      password: dbConfig.password,
      database_name: dbConfig.database,
      schema_json: null, // Add schema if needed
    }

    const response = await fetch(`${API_BASE_URL}/db-config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.detail || "Failed to save database configuration" }
    }

    return { success: true }
  } catch (error) {
    console.error("DB config error:", error)
    return { success: false, error: "Network error. Please try again." }
  }
}

export async function processTextQuery(query: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/text-query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.detail || "Query failed" }
    }

    const data = await response.json()
    return {
      success: true,
      data: {
        question: query,
        transcription: query,
        sql: data.sql || null,
        result: data.response || null,
      },
    }
  } catch (error) {
    console.error("Text query error:", error)
    return { success: false, error: "Network error. Please try again." }
  }
}

export async function processVoiceQuery(audioBlob: Blob): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('audioBlob', audioBlob);
    
    const formData = new FormData()
    formData.append("audio", audioBlob, "recording.wav")

    const response = await fetch(`${API_BASE_URL}/voice-query`, {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.detail || "Voice query failed" }
    }

    const data = await response.json()
    console.log( data);
    
    return {
      success: true,
      data: {
        transcription: data.transcription || "Voice query",
        sql: data.sql || null,
        result: data.response || null,
      },
    }
  } catch (error) {
    console.error("Voice query error:", error)
    return { success: false, error: "Network error. Please try again." }
  }
}

