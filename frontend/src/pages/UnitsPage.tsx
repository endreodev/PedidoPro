import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { showToast } from '../components/common/Toast'
import RefreshButton from '../components/common/RefreshButton'
import FilterInput from '../components/common/FilterInput'
import { Unit } from '../types'

export default function UnitsPage() {
  const navigate = useNavigate()
  const company = useAppStore((s) => s.currentCompany)
  const searchQuery = useAppStore((s) => s.searchQuery).trim().toLowerCase()
  const units = useDataStore((s) => s.units)
  const removeUnit = useDataStore((s) => s.removeUnit)
  const [filter, setFilter] = useState('')

  const q = filter.trim().toLowerCase()
  const list = units
    .filter((u) => u.company_id === company?.id)
    .filter((u) => {
      const hay = `${u.slug} ${u.description}`.toLowerCase()
      return hay.includes(searchQuery) && hay.includes(q)
    })

  const del = (u: Unit) => { removeUnit(u.id); showToast('Unidade excluída', 'success') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <FilterInput value={filter} onChange={setFilter} placeholder="Filtrar unidades..." />
        <div className="flex items-center gap-2">
          <RefreshButton />
          <button onClick={() => navigate('/units/new')} className="inline-flex items-center gap-2 bg-primary text-white rounded-md px-4 h-10 font-600 hover:opacity-90">
            <Plus size={18} /> Nova unidade
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-secondary">
              <th className="px-4 py-3 font-600">Sigla</th>
              <th className="px-4 py-3 font-600">Descrição</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 text-text-primary hover:bg-background/50 cursor-pointer" onClick={() => navigate(`/units/${u.id}`)}>
                <td className="px-4 py-3"><span className="inline-flex px-2 py-1 rounded bg-background mono uppercase">{u.slug}</span></td>
                <td className="px-4 py-3">{u.description}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => navigate(`/units/${u.id}`)} className="p-2 rounded hover:bg-background text-text-secondary"><Pencil size={16} /></button>
                    <button onClick={() => del(u)} className="p-2 rounded hover:bg-background text-error"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-text-secondary">Nenhuma unidade</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
