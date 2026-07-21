import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useFinanceiroStore } from '../../stores/financeiroStore'
import { useAppStore } from '../../stores/appStore'
import { showToast } from '../../components/common/Toast'

export default function ContaFinanceiraEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const company = useAppStore((s) => s.currentCompany)
  const contas = useFinanceiroStore((s) => s.contas)
  const saveConta = useFinanceiroStore((s) => s.saveConta)
  const editing = id ? contas.find((c) => c.id === id) : null

  const [nome, setNome] = useState(editing?.nome ?? '')
  const [tipo, setTipo] = useState<'receita' | 'despesa'>(editing?.tipo ?? 'receita')
  const [ativo, setAtivo] = useState(editing?.ativo ?? true)

  const save = () => {
    if (!company) return
    if (!nome.trim()) { showToast('Informe o nome', 'error'); return }
    saveConta({ ...(editing ? { id: editing.id } : {}), nome: nome.trim(), tipo, ativo, company_id: company.id })
    showToast(editing ? 'Conta atualizada' : 'Conta criada', 'success')
    navigate('/financeiro/contas')
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/financeiro/contas')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-600"><ArrowLeft className="w-4 h-4" /> Contas</button>
        <h2 className="text-lg font-800 text-text-primary ml-1">{editing ? 'Editar conta' : 'Nova conta'}</h2>
      </div>
      <section className="bg-surface border border-border rounded-lg shadow-card p-6 space-y-4">
        <label className="block text-sm">Nome / Categoria<input className="input" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus /></label>
        <label className="block text-sm">Tipo
          <select className="input" value={tipo} onChange={(e) => setTipo(e.target.value as 'receita' | 'despesa')}>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-text-primary"><input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} /> Ativa</label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => navigate('/financeiro/contas')} className="px-4 h-10 rounded-md border border-border text-text-secondary font-600">Cancelar</button>
          <button onClick={save} className="px-5 h-10 rounded-md bg-primary text-white font-600">Salvar</button>
        </div>
      </section>
    </div>
  )
}
