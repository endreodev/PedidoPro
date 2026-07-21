import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useFinanceiroStore, Titulo } from '../../stores/financeiroStore'
import { useAppStore } from '../../stores/appStore'
import { showToast } from '../../components/common/Toast'

export default function TituloEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const company = useAppStore((s) => s.currentCompany)
  const cid = company?.id ?? ''
  const titulos = useFinanceiroStore((s) => s.titulos)
  const contas = useFinanceiroStore((s) => s.contas).filter((c) => c.company_id === cid)
  const bancos = useFinanceiroStore((s) => s.bancos).filter((b) => b.company_id === cid)
  const saveTitulo = useFinanceiroStore((s) => s.saveTitulo)
  const editing = id ? titulos.find((t) => t.id === id) : null

  const [form, setForm] = useState({
    tipo: (editing?.tipo ?? 'receber') as Titulo['tipo'],
    descricao: editing?.descricao ?? '',
    valor: editing?.valor ?? 0,
    vencimento: editing?.vencimento ?? '2026-07-16',
    contaId: editing?.contaId ?? (contas[0]?.id ?? ''),
    contaBancariaId: editing?.contaBancariaId ?? (bancos[0]?.id ?? ''),
    status: (editing?.status ?? 'aberto') as Titulo['status'],
  })
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
    if (!company) return
    if (!form.descricao.trim()) { showToast('Informe a descrição', 'error'); return }
    saveTitulo({ ...(editing ? { id: editing.id } : {}), ...form, origem: editing?.origem ?? 'manual', createdAt: editing?.createdAt ?? new Date().toISOString(), company_id: company.id })
    showToast(editing ? 'Título atualizado' : 'Título criado', 'success')
    navigate('/financeiro/titulos')
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/financeiro/titulos')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-600"><ArrowLeft className="w-4 h-4" /> Títulos</button>
        <h2 className="text-lg font-800 text-text-primary ml-1">{editing ? 'Editar título' : 'Novo título'}</h2>
      </div>
      <section className="bg-surface border border-border rounded-lg shadow-card p-6">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Tipo
            <select className="input" value={form.tipo} onChange={(e) => set('tipo', e.target.value as Titulo['tipo'])}>
              <option value="receber">A receber</option>
              <option value="pagar">A pagar</option>
            </select>
          </label>
          <label className="text-sm">Status
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value as Titulo['status'])}>
              <option value="aberto">Em aberto</option>
              <option value="baixado">Baixado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </label>
          <label className="col-span-2 text-sm">Descrição<input className="input" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} autoFocus /></label>
          <label className="text-sm">Valor<input type="number" step="0.01" className="input mono" value={form.valor} onChange={(e) => set('valor', Number(e.target.value))} /></label>
          <label className="text-sm">Vencimento<input type="date" className="input" value={form.vencimento} onChange={(e) => set('vencimento', e.target.value)} /></label>
          <label className="text-sm">Conta / Categoria
            <select className="input" value={form.contaId} onChange={(e) => set('contaId', e.target.value)}>
              {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </label>
          <label className="text-sm">Conta bancária
            <select className="input" value={form.contaBancariaId} onChange={(e) => set('contaBancariaId', e.target.value)}>
              {bancos.map((b) => <option key={b.id} value={b.id}>{b.descricao}</option>)}
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => navigate('/financeiro/titulos')} className="px-4 h-10 rounded-md border border-border text-text-secondary font-600">Cancelar</button>
          <button onClick={save} className="px-5 h-10 rounded-md bg-primary text-white font-600">Salvar</button>
        </div>
      </section>
    </div>
  )
}
