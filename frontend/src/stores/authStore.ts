import { create } from 'zustand'
import { User } from '../types'
import api from '../api/client'
import { useAppStore } from './appStore'
import { useDataStore } from './dataStore'
import { useCaixaStore } from './caixaStore'
import { useFinanceiroStore } from './financeiroStore'

interface AuthStore {
  user: User | null
  isLoading: boolean
  error: string | null

  setUser: (user: User | null) => void
  setError: (error: string | null) => void

  handleLogin: (email: string, password: string) => Promise<void>
  handleSignup: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>
  handleLogout: () => Promise<void>
  checkAuth: () => Promise<void>
}

function activate(user: User) {
  if (user.companies[0]) useAppStore.getState().setCurrentCompany(user.companies[0])
  // Carrega dados reais do banco para a empresa ativa.
  useDataStore.getState().hydrate()
  useCaixaStore.getState().hydrate()
  useFinanceiroStore.getState().hydrate()
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user }),
  setError: (error) => set({ error }),

  handleLogin: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const user: User = data.data.user
      localStorage.setItem('token', data.data.token)
      activate(user)
      set({ user, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: 'Credenciais inválidas.' })
      throw err
    }
  },

  handleSignup: async () => {
    // Cadastro público desabilitado — usuários são criados pela tela de Usuários (admin).
    throw new Error('Cadastro indisponível. Peça a um administrador para criar seu acesso.')
  },

  handleLogout: async () => {
    localStorage.removeItem('token')
    set({ user: null, isLoading: false, error: null })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      set({ isLoading: false })
      return
    }
    try {
      const { data } = await api.get('/auth/me')
      const user: User = data.data
      activate(user)
      set({ user, isLoading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, isLoading: false })
    }
  },
}))
