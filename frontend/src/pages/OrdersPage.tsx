import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { showToast } from '../components/common/Toast'
import FilterInput from '../components/common/FilterInput'
import { Order } from '../types'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const tint = (hex: string) => ({ backgroundColor: `${hex}22`, color: hex })

type Status = Order['status']
const STATUS: Record<Status, { label: string; color: string }> = {
  orcamento: { label: 'Orçamento', color: '#7d5bd6' },
  draft: { label: 'Rascunho', color: '#8b93a2' },
  open: { label: 'Em aberto', color: '#3a7bd5' },
  separating: { label: 'Em separação', color: '#c47f16' },
  completed: { label: 'Concluído', color: '#1f9d6b' },
  canceled: { label: 'Cancelado', color: '#d64545' },
}
// Orçamento é negociação; converte para "Em aberto" ao avançar.
const NEXT: Partial<Record<Status, Status>> = { orcamento: 'open', open: 'separating', separating: 'completed' }
const FILTERS: { key: string; label: string }[] = [
  { key: 'all', label: 'Todos' }, { key: 'orcamento', label: 'Orçamento' }, { key: 'open', label: 'Em aberto' },
  { key: 'separating', label: 'Em separação' }, { key: 'completed', label: 'Concluído' }, { key: 'canceled', label: 'Cancelado' },
]

export default function OrdersPage() {
  const navigate = useNavigate()
  const company = useAppStore((s) => s.currentCompany)
  const cid = company?.id ?? ''
  const orders = useDataStore((s) => s.orders).filter((o) => o.company_id === cid)
  const customers = useDataStore((s) => s.customers)
  const saveOrder = useDataStore((s) => s.saveOrder)
  const removeOrder = useDataStore((s) => s.removeOrder)

  const [filter, setFilter] = useState('all')
  const [textFilter, setTextFilter] = useState('')
  const tf = textFilter.toLowerCase()

  const list = orders.filter((o) => {
    if (filter !== 'all' && o.status !== filter) return false
    if (!tf) return true
    const cname = customers.find((c) => c.id === o.customer_id)?.name ?? ''
    return `#${o.number} ${cname}`.toLowerCase().includes(tf)
  })

  const advance = (o: Order) => {
    const nx = NEXT[o.status]
    if (nx) { saveOrder({ ...o, status: nx }); showToast(`Pedido → ${STATUS[nx].label}`, 'success') }
  }
  const del = (o: Order) => { removeOrder(o.id); showToast('Pedido excluído', 'success') }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FilterInput value={textFilter} onChange={setTextFilter} placeholder="Filtrar por nº ou cliente..." />
        <button onClick={() => navigate('/orders/new')} className="ml-auto flex items-center gap-2 bg-primary text-white rounded-md px-4 h-10 font-600 hover:opacity-90"><Plus className="w-4 h-4" /> Novo pedido</button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 h-8 rounded-full text-sm font-600 border ${filter === f.key ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>{f.label}</button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-border">
              <th className="p-3 font-600">Pedido</th><th className="p-3 font-600">Cliente</th>
              <th className="p-3 font-600 text-center">Itens</th><th className="p-3 font-600 text-right">Total</th>
              <th className="p-3 font-600">Status</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => {
              const c = customers.find((x) => x.id === o.customer_id)
              return (
                <tr key={o.id} className="border-b border-border last:border-0 text-text-primary hover:bg-background/50 cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                  <td className="p-3 mono text-primary font-700">#{o.number}</td>
                  <td className="p-3">{c?.name ?? 'Consumidor'}</td>
                  <td className="p-3 text-center mono">{o.items.length}</td>
                  <td className="p-3 mono text-right">{brl(o.total)}</td>
                  <td className="p-3"><span className="px-2 py-1 rounded text-xs font-600" style={tint(STATUS[o.status].color)}>{STATUS[o.status].label}</span></td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <button disabled={!NEXT[o.status]} onClick={() => advance(o)} title="Avançar status" className="p-2 rounded hover:bg-background text-text-secondary disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                      <button onClick={() => navigate(`/orders/${o.id}`)} className="p-2 rounded hover:bg-background text-text-secondary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => del(o)} className="p-2 rounded hover:bg-background text-error"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {list.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-text-secondary">Nenhum pedido</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
