import api from './client'
import { ProductGroup } from '../types'

export async function listGroups(): Promise<ProductGroup[]> {
  const { data } = await api.get('/grupos-produto')
  return data.data
}
export async function createGroup(payload: Partial<ProductGroup>): Promise<ProductGroup> {
  const { data } = await api.post('/grupos-produto', payload)
  return data.data
}
export async function updateGroup(id: string, payload: Partial<ProductGroup>): Promise<ProductGroup> {
  const { data } = await api.put(`/grupos-produto/${id}`, payload)
  return data.data
}
export async function deleteGroup(id: string): Promise<void> {
  await api.delete(`/grupos-produto/${id}`)
}
