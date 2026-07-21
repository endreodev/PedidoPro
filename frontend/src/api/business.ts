import api from './client'
import { Customer, Product, ProductGroup, Unit, PaymentForm, Order } from '../types'

// Customers
export const getCustomers = async (companyId: string): Promise<Customer[]> => {
  const response = await api.get(`/companies/${companyId}/customers`)
  return response.data.data
}

export const getCustomer = async (companyId: string, id: string): Promise<Customer> => {
  const response = await api.get(`/companies/${companyId}/customers/${id}`)
  return response.data.data
}

export const createCustomer = async (companyId: string, data: Partial<Customer>): Promise<Customer> => {
  const response = await api.post(`/companies/${companyId}/customers`, data)
  return response.data.data
}

export const updateCustomer = async (
  companyId: string,
  id: string,
  data: Partial<Customer>
): Promise<Customer> => {
  const response = await api.put(`/companies/${companyId}/customers/${id}`, data)
  return response.data.data
}

export const deleteCustomer = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/companies/${companyId}/customers/${id}`)
}

// Products
export const getProducts = async (companyId: string): Promise<Product[]> => {
  const response = await api.get(`/companies/${companyId}/products`)
  return response.data.data
}

export const getProduct = async (companyId: string, id: string): Promise<Product> => {
  const response = await api.get(`/companies/${companyId}/products/${id}`)
  return response.data.data
}

export const createProduct = async (companyId: string, data: Partial<Product>): Promise<Product> => {
  const response = await api.post(`/companies/${companyId}/products`, data)
  return response.data.data
}

export const updateProduct = async (
  companyId: string,
  id: string,
  data: Partial<Product>
): Promise<Product> => {
  const response = await api.put(`/companies/${companyId}/products/${id}`, data)
  return response.data.data
}

export const deleteProduct = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/companies/${companyId}/products/${id}`)
}

// Product Groups
export const getProductGroups = async (companyId: string): Promise<ProductGroup[]> => {
  const response = await api.get(`/companies/${companyId}/product-groups`)
  return response.data.data
}

export const createProductGroup = async (
  companyId: string,
  data: Partial<ProductGroup>
): Promise<ProductGroup> => {
  const response = await api.post(`/companies/${companyId}/product-groups`, data)
  return response.data.data
}

export const updateProductGroup = async (
  companyId: string,
  id: string,
  data: Partial<ProductGroup>
): Promise<ProductGroup> => {
  const response = await api.put(`/companies/${companyId}/product-groups/${id}`, data)
  return response.data.data
}

export const deleteProductGroup = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/companies/${companyId}/product-groups/${id}`)
}

// Units
export const getUnits = async (companyId: string): Promise<Unit[]> => {
  const response = await api.get(`/companies/${companyId}/units`)
  return response.data.data
}

export const createUnit = async (companyId: string, data: Partial<Unit>): Promise<Unit> => {
  const response = await api.post(`/companies/${companyId}/units`, data)
  return response.data.data
}

export const updateUnit = async (
  companyId: string,
  id: string,
  data: Partial<Unit>
): Promise<Unit> => {
  const response = await api.put(`/companies/${companyId}/units/${id}`, data)
  return response.data.data
}

export const deleteUnit = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/companies/${companyId}/units/${id}`)
}

// Payment Forms
export const getPaymentForms = async (companyId: string): Promise<PaymentForm[]> => {
  const response = await api.get(`/companies/${companyId}/payment-forms`)
  return response.data.data
}

export const createPaymentForm = async (
  companyId: string,
  data: Partial<PaymentForm>
): Promise<PaymentForm> => {
  const response = await api.post(`/companies/${companyId}/payment-forms`, data)
  return response.data.data
}

export const updatePaymentForm = async (
  companyId: string,
  id: string,
  data: Partial<PaymentForm>
): Promise<PaymentForm> => {
  const response = await api.put(`/companies/${companyId}/payment-forms/${id}`, data)
  return response.data.data
}

export const deletePaymentForm = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/companies/${companyId}/payment-forms/${id}`)
}

// Orders
export const getOrders = async (companyId: string): Promise<Order[]> => {
  const response = await api.get(`/companies/${companyId}/orders`)
  return response.data.data
}

export const getOrder = async (companyId: string, id: string): Promise<Order> => {
  const response = await api.get(`/companies/${companyId}/orders/${id}`)
  return response.data.data
}

export const createOrder = async (companyId: string, data: Partial<Order>): Promise<Order> => {
  const response = await api.post(`/companies/${companyId}/orders`, data)
  return response.data.data
}

export const updateOrder = async (
  companyId: string,
  id: string,
  data: Partial<Order>
): Promise<Order> => {
  const response = await api.put(`/companies/${companyId}/orders/${id}`, data)
  return response.data.data
}

export const updateOrderStatus = async (
  companyId: string,
  id: string,
  status: string
): Promise<Order> => {
  const response = await api.patch(`/companies/${companyId}/orders/${id}`, { status })
  return response.data.data
}

export const deleteOrder = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/companies/${companyId}/orders/${id}`)
}
