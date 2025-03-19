import { create } from "zustand"

interface UIState {
  configPanelOpen: boolean
  openConfigPanel: () => void
  closeConfigPanel: () => void
  toggleConfigPanel: () => void
}

export const useUIStore = create<UIState>()((set) => ({
  configPanelOpen: false,
  openConfigPanel: () => set({ configPanelOpen: true }),
  closeConfigPanel: () => set({ configPanelOpen: false }),
  toggleConfigPanel: () => set((state) => ({ configPanelOpen: !state.configPanelOpen })),
}))

