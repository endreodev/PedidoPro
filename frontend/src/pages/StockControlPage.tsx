import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Minus, Plus, Pencil } from 'lucide-react'
import { useDataStore, useScopedProducts } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import RefreshButton from '../components/common/RefreshButton'
import FilterInput from '../components/common/FilterInput'
import { Product } from '../types'

const tint = (hex: string) => ({ backgroundColor: `${hex}22`, color: hex })

type Status = { label: string; color: string }
function statusOf(p: Product): Status {
  if (p.stock <= p.min_stock * 0.5) return { label: 'Crítico', color: '#d64545' }
  if (p.stock <= p.min_stock) return { label: 'Baixo', color: '#c47f16' }
  return { label: 'OK', color: '#1f9d6b' }
}

export default function StockControlPage() {
  const navigate = useNavigate()
  const company = useAppStore((s) => s.currentCompany)
  const search = useAppStore((s) => s.searchQuery).toLowerCase()
  const scopedProducts = useScopedProducts(company?.id)
  const groups = useDataStore((s) => s.groups)
  const adjustStock = useDataStore((s) => s.adjustStock)
  const [filter, setFilter] = useState('')

  const q = filter.toLowerCase()
  const list = scopedProducts.filter((p) => {
    const t = `${p.name} ${p.sku}`.toLowerCase()
    return t.includes(search) && t.includes(q)
  })
  const count = (label: string) => list.filter((p) => statusOf(p).label === label).length

  const summary = [
    { label: 'Saudável', value: count('OK'), color: '#1f9d6b' },
    { label: 'Baixo', value: count('Baixo'), color: '#c47f16' },
    { label: 'Crítico', value: count('Crítico'), color: '#d64545' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <FilterInput value={filter} onChange={setFilter} placeholder="Filtrar produtos..." />
        <RefreshButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {summary.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-lg shadow-card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-md flex items-center justify-center mono text-xl font-700" style={tint(s.color)}>{s.value}</div>
            <span className="text-sm font-600 text-text-primary">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-border">
              <th className="p-3 font-600">Produto</th>
              <th className="p-3 font-600">Grupo</th>
              <th className="p-3 font-600 text-right">Mínimo</th>
              <th className="p-3 font-600 text-right">Atual</th>
              <th className="p-3 font-600">Status</th>
              <th className="p-3 font-600 text-center">Ajuste rápido</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const g = groups.find((x) => x.id === p.group_id)
              const st = statusOf(p)
              return (
                <tr key={p.id} className="border-b border-border last:border-0 text-text-primary hover:bg-background/50 cursor-pointer" onClick={() => navigate(`/stock-control/${p.id}`)}>
                  <td className="p-3 font-600">{p.name}</td>
                  <td className="p-3">{g && <span className="px-2 py-1 rounded text-xs font-600" style={tint(g.color)}>{g.name}</span>}</td>
                  <td className="p-3 mono text-right text-text-secondary">{p.min_stock}</td>
                  <td className="p-3 mono text-right text-lg font-700" style={{ color: st.color }}>{p.stock}</td>
                  <td className="p-3"><span className="px-2 py-1 rounded text-xs font-600" style={tint(st.color)}>{st.label}</span></td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => adjustStock(p.id, -1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-background"><Minus className="w-3.5 h-3.5" /></button>
                      <button onClick={() => adjustStock(p.id, 1)} className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-background"><Plus className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => navigate(`/stock-control/${p.id}`)} className="p-2 rounded hover:bg-background text-text-secondary"><Pencil className="w-4 h-4" /></button>
                  </td>
                </tr>
              )
            })}
            {list.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-text-secondary">Nenhum produto</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
