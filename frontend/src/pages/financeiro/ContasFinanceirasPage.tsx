import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useFinanceiroStore } from '../../stores/financeiroStore'
import { useAppStore } from '../../stores/appStore'
import { showToast } from '../../components/common/Toast'
import FilterInput from '../../components/common/FilterInput'
import { ContaFinanceira } from '../../stores/financeiroStore'

const tint = (hex: string) => ({ backgroundColor: `${hex}22`, color: hex })

export default function ContasFinanceirasPage() {
  const navigate = useNavigate()
  const company = useAppStore((s) => s.currentCompany)
  const contas = useFinanceiroStore((s) => s.contas)
  const removeConta = useFinanceiroStore((s) => s.removeConta)
  const [filter, setFilter] = useState('')

  const q = filter.toLowerCase()
  const list = contas.filter((c) => c.company_id === company?.id && c.nome.toLowerCase().includes(q))
  const del = (c: ContaFinanceira) => { removeConta(c.id); showToast('Conta excluída', 'success') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <FilterInput value={filter} onChange={setFilter} placeholder="Filtrar contas..." />
        <button onClick={() => navigate('/financeiro/contas/new')} className="flex items-center gap-2 bg-primary text-white rounded-md px-4 h-10 font-600 hover:opacity-90"><Plus className="w-4 h-4" /> Nova conta</button>
      </div>
      <div className="bg-surface border border-border rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-border">
              <th className="p-3 font-600">Conta / Categoria</th>
              <th className="p-3 font-600">Tipo</th>
              <th className="p-3 font-600">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 text-text-primary hover:bg-background/50 cursor-pointer" onClick={() => navigate(`/financeiro/contas/${c.id}`)}>
                <td className="p-3 font-600">{c.nome}</td>
                <td className="p-3"><span className="px-2 py-1 rounded text-xs font-600" style={tint(c.tipo === 'receita' ? '#1f9d6b' : '#d64545')}>{c.tipo === 'receita' ? 'Receita' : 'Despesa'}</span></td>
                <td className="p-3">{c.ativo ? 'Ativa' : 'Inativa'}</td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => navigate(`/financeiro/contas/${c.id}`)} className="p-2 rounded hover:bg-background text-text-secondary"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => del(c)} className="p-2 rounded hover:bg-background text-error"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-text-secondary">Nenhuma conta</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
