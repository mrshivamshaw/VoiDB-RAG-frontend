export type DatabaseType = "mysql" | "postgresql" | "mongodb" | "sqlite" | "mssql"

export interface DatabaseConfig {
  type: DatabaseType
  host: string
  port: string
  user: string
  password: string
  database: string
  // Optional fields for specific database types
  connectionString?: string
  ssl?: boolean
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  type: "text" | "sql" | "result" | "error"
  timestamp: number
}

export interface QueryResult {
  columns: string[]
  rows: any[]
}

export type InputMode = "voice" | "text" | "sql"

export interface ModelConfig {
  whisperModel: string
  llmModel: string
}

export interface ChatHistory {
  voice: ChatMessage[]
  text: ChatMessage[]
  sql: ChatMessage[]
}

