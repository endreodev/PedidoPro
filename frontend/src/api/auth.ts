import api from './client'
import { User, AuthResponse, LoginRequest, SignupRequest } from '../types'

export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', data)
  return response.data
}

export const signup = async (data: SignupRequest): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', data)
  return response.data
}

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout')
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/auth/me')
  return response.data.user
}

export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await api.put('/auth/profile', data)
  return response.data.user
}

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  await api.post('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword,
  })
}
