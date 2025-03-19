import { create } from "zustand"
import { persist } from "zustand/middleware"
import { loginUser, signupUser } from "@/lib/api"

interface User {
  username: string
}

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<boolean>
  signup: (username: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,
      login: async (username, password) => {
        set({ isLoading: true, error: null })

        const result = await loginUser(username, password)

        if (result.success) {
          set({ user: { username }, isLoggedIn: true, isLoading: false })
          return true
        } else {
          set({ isLoading: false, error: result.error || "Login failed" })
          return false
        }
      },
      signup: async (username, password) => {
        set({ isLoading: true, error: null })

        const result = await signupUser(username, password)

        if (result.success) {
          set({ user: { username }, isLoggedIn: true, isLoading: false })
          return true
        } else {
          set({ isLoading: false, error: result.error || "Signup failed" })
          return false
        }
      },
      logout: () => {
        set({ user: null, isLoggedIn: false, error: null })
      },
      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)

