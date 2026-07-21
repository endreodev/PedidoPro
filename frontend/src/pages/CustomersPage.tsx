import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { showToast } from '../components/common/Toast'
import RefreshButton from '../components/common/RefreshButton'
import FilterInput from '../components/common/FilterInput'
import { Customer } from '../types'

const AVATAR_COLORS = ['#4b57d6', '#1f9d6b', '#d98a24', '#c2557a', '#2f9e8f', '#7d5bd6', '#d64545', '#3a7bd5']

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
function colorFor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function CustomersPage() {
  const navigate = useNavigate()
  const company = useAppStore((s) => s.currentCompany)
  const searchQuery = useAppStore((s) => s.searchQuery)
  const customers = useDataStore((s) => s.customers)
  const removeCustomer = useDataStore((s) => s.removeCustomer)
  const [filter, setFilter] = useState('')

  const list = useMemo(() => {
    const terms = `${searchQuery} ${filter}`.trim().toLowerCase().split(/\s+/).filter(Boolean)
    return customers
      .filter((c) => c.company_id === company?.id)
      .filter((c) => {
        if (terms.length === 0) return true
        const hay = `${c.name} ${c.email} ${c.document} ${c.city}`.toLowerCase()
        return terms.every((t) => hay.includes(t))
      })
  }, [customers, company?.id, searchQuery, filter])

  const del = (c: Customer) => { removeCustomer(c.id); showToast('Cliente excluído', 'success') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <FilterInput value={filter} onChange={setFilter} placeholder="Filtrar clientes..." />
        <div className="flex items-center gap-2">
          <RefreshButton />
          <button onClick={() => navigate('/customers/new')} className="inline-flex items-center gap-2 bg-primary text-white rounded-md px-4 h-10 font-600 hover:opacity-90">
            <Plus size={18} /> Novo cliente
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-4 py-3 font-600">Cliente</th>
              <th className="px-4 py-3 font-600">Documento</th>
              <th className="px-4 py-3 font-600">Telefone</th>
              <th className="px-4 py-3 font-600">Cidade</th>
              <th className="px-4 py-3 font-600 text-right">Total compras</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 text-text-primary hover:bg-background/50 cursor-pointer" onClick={() => navigate(`/customers/${c.id}`)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-700" style={{ background: colorFor(c.name) }}>{initials(c.name)}</div>
                    <div><p className="font-600">{c.name}</p><p className="text-xs text-text-secondary">{c.email}</p></div>
                  </div>
                </td>
                <td className="px-4 py-3 mono text-text-secondary">{c.document || '—'}</td>
                <td className="px-4 py-3">{c.phone || '—'}</td>
                <td className="px-4 py-3">{c.city || '—'}</td>
                <td className="px-4 py-3 mono text-right">{brl(c.total_purchases)}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => navigate(`/customers/${c.id}`)} className="p-2 rounded hover:bg-background text-text-secondary"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => del(c)} className="p-2 rounded hover:bg-background text-error"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-text-secondary">Nenhum cliente</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
