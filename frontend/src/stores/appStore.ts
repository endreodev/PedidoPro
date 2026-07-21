import { create } from 'zustand'
import { Company } from '../types'
import { getStoredPalette, applyPalette } from '../theme/palettes'

interface AppStore {
  currentCompany: Company | null
  currentView: string
  searchQuery: string
  sidebarOpen: boolean
  palette: string

  setCurrentCompany: (company: Company) => void
  setCurrentView: (view: string) => void
  setSearchQuery: (query: string) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setPalette: (palette: string) => void
}

export const useAppStore = create<AppStore>((set) => ({
  currentCompany: null,
  currentView: 'dashboard',
  searchQuery: '',
  sidebarOpen: true,
  palette: getStoredPalette(),

  setCurrentCompany: (company) => set({ currentCompany: company }),
  setCurrentView: (view) => set({ currentView: view }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setPalette: (palette) => set({ palette: applyPalette(palette) }),
}))
