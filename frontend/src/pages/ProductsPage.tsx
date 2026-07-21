import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useDataStore, useScopedProducts } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { showToast } from '../components/common/Toast'
import RefreshButton from '../components/common/RefreshButton'
import FilterInput from '../components/common/FilterInput'
import { Product } from '../types'

const tint = (hex: string) => ({ backgroundColor: `${hex}22`, color: hex })
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function stockColor(p: Product): string {
  if (p.stock <= p.min_stock * 0.5) return '#d64545'
  if (p.stock <= p.min_stock) return '#c47f16'
  return '#1f9d6b'
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const company = useAppStore((s) => s.currentCompany)
  const search = useAppStore((s) => s.searchQuery).toLowerCase()
  const scopedProducts = useScopedProducts(company?.id)
  const groups = useDataStore((s) => s.groups).filter((g) => g.company_id === company?.id)
  const units = useDataStore((s) => s.units).filter((u) => u.company_id === company?.id)
  const removeProduct = useDataStore((s) => s.removeProduct)
  const [filter, setFilter] = useState('')

  const q = filter.toLowerCase()
  const list = scopedProducts.filter((p) => {
    const t = `${p.name} ${p.sku}`.toLowerCase()
    return t.includes(search) && t.includes(q)
  })

  const del = (p: Product) => { removeProduct(p.id); showToast('Produto excluído', 'success') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <FilterInput value={filter} onChange={setFilter} placeholder="Filtrar produtos..." />
        <div className="flex gap-2">
          <RefreshButton />
          <button onClick={() => navigate('/products/new')} className="flex items-center gap-2 bg-primary text-white rounded-md px-4 h-10 font-600 hover:opacity-90">
            <Plus className="w-4 h-4" /> Novo produto
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-border">
              <th className="p-3 font-600">SKU</th>
              <th className="p-3 font-600">Produto</th>
              <th className="p-3 font-600">Grupo</th>
              <th className="p-3 font-600">Unidade</th>
              <th className="p-3 font-600 text-right">Custo médio</th>
              <th className="p-3 font-600 text-right">Preço</th>
              <th className="p-3 font-600 text-right">Estoque</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const g = groups.find((x) => x.id === p.group_id)
              const u = units.find((x) => x.id === p.unit_id)
              return (
                <tr key={p.id} className="border-b border-border last:border-0 text-text-primary hover:bg-background/50 cursor-pointer" onClick={() => navigate(`/products/${p.id}`)}>
                  <td className="p-3 mono text-text-secondary">{p.sku}</td>
                  <td className="p-3 font-600">{p.name}</td>
                  <td className="p-3">{g && <span className="px-2 py-1 rounded text-xs font-600" style={tint(g.color)}>{g.name}</span>}</td>
                  <td className="p-3 mono">{u?.slug ?? '—'}</td>
                  <td className="p-3 mono text-right text-text-secondary">{brl(p.custo_medio)}</td>
                  <td className="p-3 mono text-right">{brl(p.price)}</td>
                  <td className="p-3 mono text-right font-700" style={{ color: stockColor(p) }}>{p.stock}</td>
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <button onClick={() => navigate(`/products/${p.id}`)} className="p-2 rounded hover:bg-background text-text-secondary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => del(p)} className="p-2 rounded hover:bg-background text-error"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {list.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-text-secondary">Nenhum produto</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
