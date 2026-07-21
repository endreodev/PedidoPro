import api from './client'
import { PaymentForm } from '../types'

export async function listPaymentForms(): Promise<PaymentForm[]> {
  const { data } = await api.get('/formas-pagamento'); return data.data
}
export async function createPaymentForm(p: Partial<PaymentForm>): Promise<PaymentForm> {
  const { data } = await api.post('/formas-pagamento', p); return data.data
}
export async function updatePaymentForm(id: string, p: Partial<PaymentForm>): Promise<PaymentForm> {
  const { data } = await api.put(`/formas-pagamento/${id}`, p); return data.data
}
export async function deletePaymentForm(id: string): Promise<void> { await api.delete(`/formas-pagamento/${id}`) }
