import api from './client'
import { UserInCompany } from '../types'

export async function listUsuarios(): Promise<UserInCompany[]> {
  const { data } = await api.get('/usuarios'); return data.data
}
export async function createUsuario(u: Partial<UserInCompany>): Promise<UserInCompany> {
  const { data } = await api.post('/usuarios', u); return data.data
}
export async function updateUsuario(id: string, u: Partial<UserInCompany>): Promise<UserInCompany> {
  const { data } = await api.put(`/usuarios/${id}`, u); return data.data
}
export async function deleteUsuario(id: string): Promise<void> { await api.delete(`/usuarios/${id}`) }
