import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useFinanceiroStore, ContaBancaria } from '../../stores/financeiroStore'
import { useAppStore } from '../../stores/appStore'
import { showToast } from '../../components/common/Toast'

export default function ContaBancariaEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const company = useAppStore((s) => s.currentCompany)
  const bancos = useFinanceiroStore((s) => s.bancos)
  const saveBanco = useFinanceiroStore((s) => s.saveBanco)
  const editing = id ? bancos.find((b) => b.id === id) : null

  const [form, setForm] = useState({
    descricao: editing?.descricao ?? '',
    banco: editing?.banco ?? '',
    agencia: editing?.agencia ?? '',
    conta: editing?.conta ?? '',
    tipo: (editing?.tipo ?? 'corrente') as ContaBancaria['tipo'],
    saldoInicial: editing?.saldoInicial ?? 0,
    ativo: editing?.ativo ?? true,
  })
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
    if (!company) return
    if (!form.descricao.trim()) { showToast('Informe a descrição', 'error'); return }
    saveBanco({ ...(editing ? { id: editing.id } : {}), ...form, company_id: company.id })
    showToast(editing ? 'Conta bancária atualizada' : 'Conta bancária criada', 'success')
    navigate('/financeiro/bancos')
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/financeiro/bancos')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-600"><ArrowLeft className="w-4 h-4" /> Contas bancárias</button>
        <h2 className="text-lg font-800 text-text-primary ml-1">{editing ? 'Editar conta bancária' : 'Nova conta bancária'}</h2>
      </div>
      <section className="bg-surface border border-border rounded-lg shadow-card p-6">
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 text-sm">Descrição<input className="input" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} autoFocus /></label>
          <label className="text-sm">Banco<input className="input" value={form.banco} onChange={(e) => set('banco', e.target.value)} /></label>
          <label className="text-sm">Tipo
            <select className="input" value={form.tipo} onChange={(e) => set('tipo', e.target.value as ContaBancaria['tipo'])}>
              <option value="corrente">Corrente</option>
              <option value="poupanca">Poupança</option>
              <option value="caixa">Caixa</option>
            </select>
          </label>
          <label className="text-sm">Agência<input className="input mono" value={form.agencia} onChange={(e) => set('agencia', e.target.value)} /></label>
          <label className="text-sm">Conta<input className="input mono" value={form.conta} onChange={(e) => set('conta', e.target.value)} /></label>
          <label className="text-sm">Saldo inicial<input type="number" step="0.01" className="input mono" value={form.saldoInicial} onChange={(e) => set('saldoInicial', Number(e.target.value))} /></label>
          <label className="flex items-center gap-2 text-sm text-text-primary mt-6"><input type="checkbox" checked={form.ativo} onChange={(e) => set('ativo', e.target.checked)} /> Ativa</label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => navigate('/financeiro/bancos')} className="px-4 h-10 rounded-md border border-border text-text-secondary font-600">Cancelar</button>
          <button onClick={save} className="px-5 h-10 rounded-md bg-primary text-white font-600">Salvar</button>
        </div>
      </section>
    </div>
  )
}
