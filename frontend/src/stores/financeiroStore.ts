import { create } from 'zustand'
import { CaixaSession, resumoCaixa } from './caixaStore'
import {
  listNaturezas, createNatureza, updateNatureza, deleteNatureza,
  listContasBancarias, createContaBancaria, updateContaBancaria, deleteContaBancaria,
  listTitulos, createTitulo, updateTitulo, baixarTituloApi, deleteTitulo,
} from '../api/financeiro'

export interface ContaFinanceira {
  id: string
  nome: string
  tipo: 'receita' | 'despesa'
  ativo: boolean
  company_id: string
}

export interface ContaBancaria {
  id: string
  descricao: string
  banco: string
  agencia: string
  conta: string
  tipo: 'corrente' | 'poupanca' | 'caixa'
  saldoInicial: number
  ativo: boolean
  company_id: string
}

export interface Titulo {
  id: string
  tipo: 'receber' | 'pagar'
  descricao: string
  valor: number
  vencimento: string
  status: 'aberto' | 'baixado' | 'cancelado'
  contaId?: string | null
  contaBancariaId?: string | null
  formaPagamento?: string
  origem: 'caixa' | 'manual'
  caixaSessionId?: string | null
  createdAt: string
  company_id: string
}

interface FinanceiroStore {
  contas: ContaFinanceira[]
  bancos: ContaBancaria[]
  titulos: Titulo[]

  hydrate: () => void
  saveConta: (data: Partial<ContaFinanceira> & { company_id: string }) => void
  removeConta: (id: string) => void
  saveBanco: (data: Partial<ContaBancaria> & { company_id: string }) => void
  removeBanco: (id: string) => void
  saveTitulo: (data: Partial<Titulo> & { company_id: string }) => void
  removeTitulo: (id: string) => void
  baixarTitulo: (id: string) => void
  gerarTitulosDoCaixa: (session: CaixaSession, companyId: string, contaReceitaId?: string) => number
}

export const useFinanceiroStore = create<FinanceiroStore>((set, get) => ({
  contas: [],
  bancos: [],
  titulos: [],

  hydrate: () => {
    void (async () => {
      try {
        const [contas, bancos, titulos] = await Promise.all([listNaturezas(), listContasBancarias(), listTitulos()])
        set({ contas, bancos, titulos })
      } catch (e) { console.error('Falha ao carregar financeiro', e) }
    })()
  },

  saveConta: (data) => {
    void (async () => {
      try {
        if (data.id && get().contas.some((c) => c.id === data.id)) await updateNatureza(data.id, data)
        else await createNatureza(data)
        get().hydrate()
      } catch (e) { console.error(e) }
    })()
  },
  removeConta: (id) => {
    set((s) => ({ contas: s.contas.filter((x) => x.id !== id) }))
    void (async () => { try { await deleteNatureza(id) } catch (e) { console.error(e); get().hydrate() } })()
  },

  saveBanco: (data) => {
    void (async () => {
      try {
        if (data.id && get().bancos.some((b) => b.id === data.id)) await updateContaBancaria(data.id, data)
        else await createContaBancaria(data)
        get().hydrate()
      } catch (e) { console.error(e) }
    })()
  },
  removeBanco: (id) => {
    set((s) => ({ bancos: s.bancos.filter((x) => x.id !== id) }))
    void (async () => { try { await deleteContaBancaria(id) } catch (e) { console.error(e); get().hydrate() } })()
  },

  saveTitulo: (data) => {
    void (async () => {
      try {
        if (data.id && get().titulos.some((t) => t.id === data.id)) await updateTitulo(data.id, data)
        else await createTitulo(data)
        get().hydrate()
      } catch (e) { console.error(e) }
    })()
  },
  removeTitulo: (id) => {
    set((s) => ({ titulos: s.titulos.filter((x) => x.id !== id) }))
    void (async () => { try { await deleteTitulo(id) } catch (e) { console.error(e); get().hydrate() } })()
  },
  baixarTitulo: (id) => {
    set((s) => ({ titulos: s.titulos.map((t) => (t.id === id ? { ...t, status: 'baixado' } : t)) }))
    void (async () => { try { await baixarTituloApi(id) } catch (e) { console.error(e); get().hydrate() } })()
  },

  // Gera um título "a receber" (baixado) por forma de pagamento da sessão de caixa.
  gerarTitulosDoCaixa: (session, companyId, contaReceitaId) => {
    if (get().titulos.some((t) => t.caixaSessionId === session.id)) return 0
    const r = resumoCaixa(session)
    const formas = Object.values(r.porForma)
    if (formas.length === 0) return 0
    void (async () => {
      try {
        for (const v of formas) {
          await createTitulo({
            tipo: 'receber',
            descricao: `Recebimento caixa ${session.operator} · ${v.name}`,
            valor: v.total,
            vencimento: (session.closedAt ?? session.openedAt ?? '').slice(0, 10),
            status: 'baixado',
            contaId: contaReceitaId,
            formaPagamento: v.name,
            origem: 'caixa',
            caixaSessionId: session.id,
            company_id: companyId,
          })
        }
        get().hydrate()
      } catch (e) { console.error(e) }
    })()
    return formas.length
  },
}))
