import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { showToast } from '../components/common/Toast'
import { PaymentForm } from '../types'

type PFType = PaymentForm['type']
const TYPES: { value: PFType; label: string }[] = [
  { value: 'cash', label: 'Dinheiro' }, { value: 'pix', label: 'Pix' }, { value: 'card', label: 'Cartão' },
  { value: 'boleto', label: 'Boleto' }, { value: 'transfer', label: 'Transferência' },
]

export default function PaymentMethodEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const company = useAppStore((s) => s.currentCompany)
  const forms = useDataStore((s) => s.paymentForms)
  const savePaymentForm = useDataStore((s) => s.savePaymentForm)
  const editing = id ? forms.find((f) => f.id === id) : null

  const [form, setForm] = useState({
    name: editing?.name ?? '',
    type: (editing?.type ?? 'cash') as PFType,
    fee_percentage: editing?.fee_percentage ?? 0,
    payment_deadline: editing?.payment_deadline ?? 0,
    is_active: editing?.is_active ?? true,
  })
  const set = (k: keyof typeof form, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
    if (!company) return
    if (!form.name.trim()) { showToast('Informe o nome', 'error'); return }
    savePaymentForm({ ...(editing ? { id: editing.id } : {}), ...form, company_id: company.id })
    showToast(editing ? 'Forma atualizada' : 'Forma criada', 'success')
    navigate('/payment-methods')
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/payment-methods')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-600">
          <ArrowLeft className="w-4 h-4" /> Formas de Pagamento
        </button>
        <h2 className="text-lg font-800 text-text-primary ml-1">{editing ? 'Editar forma' : 'Nova forma'}</h2>
      </div>
      <section className="bg-surface border border-border rounded-lg shadow-card p-6 space-y-4">
        <label className="block text-sm">Nome<input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus /></label>
        <label className="block text-sm">Tipo
          <select className="input" value={form.type} onChange={(e) => set('type', e.target.value as PFType)}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">Taxa (%)<input type="number" step="0.1" className="input mono" value={form.fee_percentage} onChange={(e) => set('fee_percentage', Number(e.target.value))} /></label>
          <label className="block text-sm">Prazo (dias)<input type="number" className="input mono" value={form.payment_deadline} onChange={(e) => set('payment_deadline', Number(e.target.value))} /></label>
        </div>
        <label className="flex items-center gap-2 text-sm text-text-primary">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} /> Ativa (aparece no PDV)
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => navigate('/payment-methods')} className="px-4 h-10 rounded-md border border-border text-text-secondary font-600">Cancelar</button>
          <button onClick={save} className="px-5 h-10 rounded-md bg-primary text-white font-600">Salvar</button>
        </div>
      </section>
    </div>
  )
}
