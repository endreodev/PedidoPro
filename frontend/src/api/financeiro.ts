import api from './client'
import type { ContaFinanceira, ContaBancaria, Titulo } from '../stores/financeiroStore'

export const listNaturezas = async (): Promise<ContaFinanceira[]> => (await api.get('/financeiro/naturezas')).data.data
export const createNatureza = async (p: Partial<ContaFinanceira>): Promise<ContaFinanceira> => (await api.post('/financeiro/naturezas', p)).data.data
export const updateNatureza = async (id: string, p: Partial<ContaFinanceira>): Promise<ContaFinanceira> => (await api.put(`/financeiro/naturezas/${id}`, p)).data.data
export const deleteNatureza = async (id: string): Promise<void> => { await api.delete(`/financeiro/naturezas/${id}`) }

export const listContasBancarias = async (): Promise<ContaBancaria[]> => (await api.get('/financeiro/contas-bancarias')).data.data
export const createContaBancaria = async (p: Partial<ContaBancaria>): Promise<ContaBancaria> => (await api.post('/financeiro/contas-bancarias', p)).data.data
export const updateContaBancaria = async (id: string, p: Partial<ContaBancaria>): Promise<ContaBancaria> => (await api.put(`/financeiro/contas-bancarias/${id}`, p)).data.data
export const deleteContaBancaria = async (id: string): Promise<void> => { await api.delete(`/financeiro/contas-bancarias/${id}`) }

export const listTitulos = async (): Promise<Titulo[]> => (await api.get('/financeiro/titulos')).data.data
export const createTitulo = async (p: Partial<Titulo>): Promise<Titulo> => (await api.post('/financeiro/titulos', p)).data.data
export const updateTitulo = async (id: string, p: Partial<Titulo>): Promise<Titulo> => (await api.put(`/financeiro/titulos/${id}`, p)).data.data
export const baixarTituloApi = async (id: string): Promise<Titulo> => (await api.put(`/financeiro/titulos/${id}/baixar`, {})).data.data
export const deleteTitulo = async (id: string): Promise<void> => { await api.delete(`/financeiro/titulos/${id}`) }
