import api from './client'
import { Order } from '../types'

export async function listOrders(): Promise<Order[]> {
  const { data } = await api.get('/pedidos'); return data.data
}
export async function createOrder(o: Partial<Order>): Promise<Order> {
  const { data } = await api.post('/pedidos', o); return data.data
}
export async function updateOrder(id: string, o: Partial<Order>): Promise<Order> {
  const { data } = await api.put(`/pedidos/${id}`, o); return data.data
}
export async function deleteOrder(id: string): Promise<void> { await api.delete(`/pedidos/${id}`) }
