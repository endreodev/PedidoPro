import api from './client'
import { Parametro } from '../types'

export async function listParametros(): Promise<Parametro[]> {
  const { data } = await api.get('/parametros'); return data.data
}
export async function updateParametro(chave: string, valor: string): Promise<Parametro> {
  const { data } = await api.put(`/parametros/${chave}`, { valor }); return data.data
}
