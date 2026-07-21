import axios, { AxiosInstance } from 'axios'
import { useAppStore } from '../stores/appStore'

// Relativo: passa pelo proxy do Vite (ver vite.config.ts) que encaminha ao backend.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Token JWT + empresa ativa em toda requisição.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  const empresa = useAppStore.getState().currentCompany
  if (empresa) config.headers['X-Empresa'] = empresa.id
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  },
)

export default api
