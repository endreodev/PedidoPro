import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Layers, Pencil, Trash2 } from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { showToast } from '../components/common/Toast'
import RefreshButton from '../components/common/RefreshButton'
import FilterInput from '../components/common/FilterInput'
import { ProductGroup } from '../types'

const tint = (hex: string) => ({ backgroundColor: `${hex}22`, color: hex })

export default function ProductGroupsPage() {
  const navigate = useNavigate()
  const company = useAppStore((s) => s.currentCompany)
  const searchQuery = useAppStore((s) => s.searchQuery).toLowerCase()
  const groups = useDataStore((s) => s.groups)
  const products = useDataStore((s) => s.products)
  const removeGroup = useDataStore((s) => s.removeGroup)
  const [filter, setFilter] = useState('')

  const q = filter.toLowerCase()
  const list = groups
    .filter((g) => g.company_id === company?.id)
    .filter((g) => g.name.toLowerCase().includes(searchQuery) && g.name.toLowerCase().includes(q))

  const countFor = (groupId: string) => products.filter((p) => p.group_id === groupId).length
  const del = (g: ProductGroup) => { removeGroup(g.id); showToast('Grupo excluído', 'success') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <FilterInput value={filter} onChange={setFilter} placeholder="Filtrar grupos..." />
        <div className="flex items-center gap-2">
          <RefreshButton />
          <button onClick={() => navigate('/product-groups/new')} className="flex items-center gap-2 bg-primary text-white rounded-md px-4 h-10 font-600 hover:opacity-90">
            <Plus size={18} /> Novo grupo
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-border">
              <th className="p-3 font-600">Grupo</th>
              <th className="p-3 font-600 text-center">Produtos</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((group) => (
              <tr key={group.id} className="border-b border-border last:border-0 text-text-primary hover:bg-background/50 cursor-pointer" onClick={() => navigate(`/product-groups/${group.id}`)}>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={tint(group.color)}><Layers size={18} /></div>
                    <span className="font-600">{group.name}</span>
                  </div>
                </td>
                <td className="p-3 text-center mono">{countFor(group.id)}</td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => navigate(`/product-groups/${group.id}`)} className="p-2 rounded hover:bg-background text-text-secondary"><Pencil size={16} /></button>
                    <button onClick={() => del(group)} className="p-2 rounded hover:bg-background text-error"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-text-secondary">Nenhum grupo</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
