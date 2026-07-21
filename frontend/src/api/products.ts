import api from './client'
import { Product } from '../types'

export async function listProducts(): Promise<Product[]> {
  const { data } = await api.get('/produtos')
  return data.data
}

export async function createProduct(payload: Partial<Product>): Promise<Product> {
  const { data } = await api.post('/produtos', payload)
  return data.data
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const { data } = await api.put(`/produtos/${id}`, payload)
  return data.data
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/produtos/${id}`)
}
