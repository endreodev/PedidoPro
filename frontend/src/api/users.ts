import api from './client'
import { UserInCompany, ActivityLog } from '../types'

// User Management
export const getUsersInCompany = async (companyId: string): Promise<UserInCompany[]> => {
  const response = await api.get(`/companies/${companyId}/users`)
  return response.data.data
}

export const inviteUserToCompany = async (
  companyId: string,
  email: string,
  role: string
): Promise<UserInCompany> => {
  const response = await api.post(`/companies/${companyId}/users/invite`, {
    email,
    role,
  })
  return response.data.data
}

export const updateUserRole = async (
  companyId: string,
  userId: string,
  role: string
): Promise<UserInCompany> => {
  const response = await api.put(`/companies/${companyId}/users/${userId}`, {
    role,
  })
  return response.data.data
}

export const removeUserFromCompany = async (
  companyId: string,
  userId: string
): Promise<void> => {
  await api.delete(`/companies/${companyId}/users/${userId}`)
}

export const deactivateUser = async (
  companyId: string,
  userId: string
): Promise<UserInCompany> => {
  const response = await api.post(`/companies/${companyId}/users/${userId}/deactivate`)
  return response.data.data
}

export const reactivateUser = async (
  companyId: string,
  userId: string
): Promise<UserInCompany> => {
  const response = await api.post(`/companies/${companyId}/users/${userId}/reactivate`)
  return response.data.data
}

// Activity Logs
export const getActivityLogs = async (
  companyId: string,
  filters?: Record<string, unknown>
): Promise<ActivityLog[]> => {
  const response = await api.get(`/companies/${companyId}/activity-logs`, {
    params: filters,
  })
  return response.data.data
}

export const getActivityLog = async (logId: string): Promise<ActivityLog> => {
  const response = await api.get(`/activity-logs/${logId}`)
  return response.data.data
}
