import api from './client'

export interface IntegToken {
  id: string
  descricao: string
  token_mascarado: string
  ativo: boolean
  criado_em: string
}

export async function listTokens(): Promise<IntegToken[]> {
  const { data } = await api.get('/integracao/tokens'); return data.data
}
export async function gerarToken(descricao: string): Promise<{ id: string; token: string }> {
  const { data } = await api.post('/integracao/tokens', { descricao }); return data.data
}
export async function revogarToken(id: string): Promise<void> {
  await api.delete(`/integracao/tokens/${id}`)
}
