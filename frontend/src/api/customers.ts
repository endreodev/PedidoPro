import api from './client'
import { Customer } from '../types'

export async function listCustomers(): Promise<Customer[]> {
  const { data } = await api.get('/parceiros'); return data.data
}
export async function createCustomer(c: Partial<Customer>): Promise<Customer> {
  const { data } = await api.post('/parceiros', c); return data.data
}
export async function updateCustomer(id: string, c: Partial<Customer>): Promise<Customer> {
  const { data } = await api.put(`/parceiros/${id}`, c); return data.data
}
export async function deleteCustomer(id: string): Promise<void> { await api.delete(`/parceiros/${id}`) }
