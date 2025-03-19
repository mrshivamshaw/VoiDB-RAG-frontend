import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DatabaseConfig, DatabaseType } from "@/lib/types"
import { saveDbConfig } from "@/lib/api"

interface DbConfigState {
  dbConfig: DatabaseConfig
  isConfigured: boolean
  isLoading: boolean
  error: string | null
  updateDbConfig: (config: Partial<DatabaseConfig>) => void
  setDbType: (type: DatabaseType) => void
  saveConfiguration: () => Promise<boolean>
  resetConfiguration: () => void
  clearError: () => void
}

const getDefaultPort = (type: DatabaseType): string => {
  switch (type) {
    case "mysql":
      return "3306"
    case "postgresql":
      return "5432"
    case "mongodb":
      return "27017"
    case "mssql":
      return "1433"
    case "sqlite":
      return ""
    default:
      return ""
  }
}

export const useDbConfigStore = create<DbConfigState>()(
  persist(
    (set, get) => ({
      dbConfig: {
        type: "mysql",
        host: "localhost",
        port: "3306",
        user: "root",
        password: "",
        database: "testing",
      },
      isConfigured: false,
      isLoading: false,
      error: null,
      updateDbConfig: (config) => {
        set((state) => ({
          dbConfig: { ...state.dbConfig, ...config },
        }))
      },
      setDbType: (type) => {
        set((state) => ({
          dbConfig: {
            ...state.dbConfig,
            type,
            port: getDefaultPort(type),
            // Reset other fields that might be specific to the previous type
            connectionString: "",
            ssl: false,
          },
        }))
      },
      saveConfiguration: async () => {
        set({ isLoading: true, error: null })

        const result = await saveDbConfig(get().dbConfig)

        if (result.success) {
          set({ isConfigured: true, isLoading: false })
          return true
        } else {
          set({ isLoading: false, error: result.error || "Failed to save configuration" })
          return false
        }
      },
      resetConfiguration: () => {
        set({ isConfigured: false, error: null })
      },
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: "db-config-storage",
    },
  ),
)

