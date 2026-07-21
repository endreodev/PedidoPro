import api from './client'
import { Plan, Subscription, Invoice, PaymentMethod } from '../types'

// Plans
export const getPlans = async (): Promise<Plan[]> => {
  const response = await api.get('/plans')
  return response.data.data
}

export const getPlan = async (id: string): Promise<Plan> => {
  const response = await api.get(`/plans/${id}`)
  return response.data.data
}

export const createPlan = async (data: Partial<Plan>): Promise<Plan> => {
  const response = await api.post('/plans', data)
  return response.data.data
}

export const updatePlan = async (id: string, data: Partial<Plan>): Promise<Plan> => {
  const response = await api.put(`/plans/${id}`, data)
  return response.data.data
}

export const deletePlan = async (id: string): Promise<void> => {
  await api.delete(`/plans/${id}`)
}

// Subscriptions
export const getSubscription = async (companyId: string): Promise<Subscription> => {
  const response = await api.get(`/companies/${companyId}/subscription`)
  return response.data.data
}

export const subscribeToPlan = async (
  companyId: string,
  planId: string,
  paymentMethodId?: string
): Promise<Subscription> => {
  const response = await api.post(`/companies/${companyId}/subscribe`, {
    plan_id: planId,
    payment_method_id: paymentMethodId,
  })
  return response.data.data
}

export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  await api.post(`/subscriptions/${subscriptionId}/cancel`)
}

export const resumeSubscription = async (subscriptionId: string): Promise<Subscription> => {
  const response = await api.post(`/subscriptions/${subscriptionId}/resume`)
  return response.data.data
}

// Invoices
export const getInvoices = async (companyId?: string): Promise<Invoice[]> => {
  const params = companyId ? { company_id: companyId } : {}
  const response = await api.get('/invoices', { params })
  return response.data.data
}

export const getInvoice = async (id: string): Promise<Invoice> => {
  const response = await api.get(`/invoices/${id}`)
  return response.data.data
}

export const payInvoice = async (invoiceId: string, paymentMethodId: string): Promise<Invoice> => {
  const response = await api.post(`/invoices/${invoiceId}/pay`, {
    payment_method_id: paymentMethodId,
  })
  return response.data.data
}

export const downloadInvoicePDF = async (invoiceId: string): Promise<Blob> => {
  const response = await api.get(`/invoices/${invoiceId}/pdf`, {
    responseType: 'blob',
  })
  return response.data
}

// Payment Methods
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get('/payment-methods')
  return response.data.data
}

export const addPaymentMethod = async (data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
  const response = await api.post('/payment-methods', data)
  return response.data.data
}

export const deletePaymentMethod = async (id: string): Promise<void> => {
  await api.delete(`/payment-methods/${id}`)
}

export const setDefaultPaymentMethod = async (id: string): Promise<PaymentMethod> => {
  const response = await api.patch(`/payment-methods/${id}/default`)
  return response.data.data
}
