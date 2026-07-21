import { create } from 'zustand'
import { listCaixas, abrirCaixa, addMovimento, fecharCaixa } from '../api/caixa'

export type MovKind = 'venda' | 'suprimento' | 'sangria'

export interface CaixaMovement {
  id: string
  kind: MovKind
  paymentType: string
  paymentName: string
  amount: number
  description: string
  at: string
}

export interface CaixaSession {
  id: string
  status: 'aberto' | 'fechado'
  operator: string
  openedAt: string
  openingAmount: number
  movements: CaixaMovement[]
  closedAt?: string | null
  countedCash?: number | null
}

interface CaixaStore {
  sessions: CaixaSession[]
  hydrate: () => void
  abrir: (openingAmount: number, operator: string) => void
  registrarVenda: (paymentType: string, paymentName: string, amount: number, description: string) => void
  ajuste: (kind: 'suprimento' | 'sangria', amount: number, description: string) => void
  fechar: (countedCash: number) => void
}

export const useCaixaStore = create<CaixaStore>((set, get) => ({
  sessions: [],

  hydrate: () => {
    void (async () => {
      try { set({ sessions: await listCaixas() }) } catch (e) { console.error('Falha ao carregar caixas', e) }
    })()
  },

  abrir: (openingAmount, operator) => {
    void (async () => {
      try { await abrirCaixa(openingAmount, operator); get().hydrate() } catch (e) { console.error(e) }
    })()
  },

  registrarVenda: (paymentType, paymentName, amount, description) => {
    const open = get().sessions.find((s) => s.status === 'aberto')
    if (!open) return
    void (async () => {
      try { await addMovimento(open.id, { kind: 'venda', paymentType, paymentName, amount, description }); get().hydrate() } catch (e) { console.error(e) }
    })()
  },

  ajuste: (kind, amount, description) => {
    const open = get().sessions.find((s) => s.status === 'aberto')
    if (!open) return
    void (async () => {
      try { await addMovimento(open.id, { kind, paymentType: 'dinheiro', paymentName: 'Dinheiro', amount, description }); get().hydrate() } catch (e) { console.error(e) }
    })()
  },

  fechar: (countedCash) => {
    const open = get().sessions.find((s) => s.status === 'aberto')
    if (!open) return
    void (async () => {
      try { await fecharCaixa(open.id, countedCash); get().hydrate() } catch (e) { console.error(e) }
    })()
  },
}))

/** Resumo por forma de pagamento + dinheiro esperado em gaveta. */
export function resumoCaixa(s: CaixaSession) {
  const porForma: Record<string, { name: string; total: number; qtd: number }> = {}
  let dinheiroVendas = 0
  let suprimentos = 0
  let sangrias = 0
  for (const m of s.movements) {
    if (m.kind === 'venda') {
      const k = m.paymentType || '-'
      porForma[k] = porForma[k] || { name: m.paymentName || k, total: 0, qtd: 0 }
      porForma[k].total += m.amount
      porForma[k].qtd += 1
      if (m.paymentType === 'dinheiro') dinheiroVendas += m.amount
    } else if (m.kind === 'suprimento') suprimentos += m.amount
    else if (m.kind === 'sangria') sangrias += m.amount
  }
  const totalVendas = Object.values(porForma).reduce((a, b) => a + b.total, 0)
  const dinheiroEsperado = s.openingAmount + dinheiroVendas + suprimentos - sangrias
  return { porForma, totalVendas, dinheiroVendas, suprimentos, sangrias, dinheiroEsperado }
}
