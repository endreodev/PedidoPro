import api from './client'
import { Unit } from '../types'

export async function listUnits(): Promise<Unit[]> {
  const { data } = await api.get('/unidades')
  return data.data
}
export async function createUnit(payload: Partial<Unit>): Promise<Unit> {
  const { data } = await api.post('/unidades', payload)
  return data.data
}
export async function updateUnit(id: string, payload: Partial<Unit>): Promise<Unit> {
  const { data } = await api.put(`/unidades/${id}`, payload)
  return data.data
}
export async function deleteUnit(id: string): Promise<void> {
  await api.delete(`/unidades/${id}`)
}
