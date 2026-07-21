import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useFinanceiroStore } from '../../stores/financeiroStore'
import { useAppStore } from '../../stores/appStore'
import { showToast } from '../../components/common/Toast'
import FilterInput from '../../components/common/FilterInput'
import { ContaBancaria } from '../../stores/financeiroStore'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const TIPO: Record<ContaBancaria['tipo'], string> = { corrente: 'Corrente', poupanca: 'Poupança', caixa: 'Caixa' }

export default function ContasBancariasPage() {
  const navigate = useNavigate()
  const company = useAppStore((s) => s.currentCompany)
  const bancos = useFinanceiroStore((s) => s.bancos)
  const removeBanco = useFinanceiroStore((s) => s.removeBanco)
  const [filter, setFilter] = useState('')

  const q = filter.toLowerCase()
  const list = bancos.filter((b) => b.company_id === company?.id && `${b.descricao} ${b.banco}`.toLowerCase().includes(q))
  const del = (b: ContaBancaria) => { removeBanco(b.id); showToast('Conta bancária excluída', 'success') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <FilterInput value={filter} onChange={setFilter} placeholder="Filtrar contas bancárias..." />
        <button onClick={() => navigate('/financeiro/bancos/new')} className="flex items-center gap-2 bg-primary text-white rounded-md px-4 h-10 font-600 hover:opacity-90"><Plus className="w-4 h-4" /> Nova conta bancária</button>
      </div>
      <div className="bg-surface border border-border rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-border">
              <th className="p-3 font-600">Descrição</th>
              <th className="p-3 font-600">Banco</th>
              <th className="p-3 font-600">Agência / Conta</th>
              <th className="p-3 font-600">Tipo</th>
              <th className="p-3 font-600 text-right">Saldo inicial</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr key={b.id} className="border-b border-border last:border-0 text-text-primary hover:bg-background/50 cursor-pointer" onClick={() => navigate(`/financeiro/bancos/${b.id}`)}>
                <td className="p-3 font-600">{b.descricao}</td>
                <td className="p-3">{b.banco}</td>
                <td className="p-3 mono">{[b.agencia, b.conta].filter(Boolean).join(' / ') || '—'}</td>
                <td className="p-3">{TIPO[b.tipo]}</td>
                <td className="p-3 mono text-right">{brl(b.saldoInicial)}</td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <button onClick={() => navigate(`/financeiro/bancos/${b.id}`)} className="p-2 rounded hover:bg-background text-text-secondary"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => del(b)} className="p-2 rounded hover:bg-background text-error"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-text-secondary">Nenhuma conta bancária</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
