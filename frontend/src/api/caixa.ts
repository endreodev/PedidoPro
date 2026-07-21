import api from './client'
import type { CaixaSession } from '../stores/caixaStore'

export async function listCaixas(): Promise<CaixaSession[]> {
  const { data } = await api.get('/caixas'); return data.data
}
export async function abrirCaixa(openingAmount: number, operator: string): Promise<CaixaSession> {
  const { data } = await api.post('/caixas', { openingAmount, operator }); return data.data
}
export async function addMovimento(id: string, mov: { kind: string; paymentType?: string; paymentName?: string; amount: number; description: string }): Promise<CaixaSession> {
  const { data } = await api.post(`/caixas/${id}/movimentos`, mov); return data.data
}
export async function fecharCaixa(id: string, countedCash: number): Promise<CaixaSession> {
  const { data } = await api.put(`/caixas/${id}/fechar`, { countedCash }); return data.data
}
