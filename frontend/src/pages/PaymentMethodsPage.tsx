import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { useAuthStore } from '../stores/authStore'
import { isReadOnly } from '../lib/permissions'
import { showToast } from '../components/common/Toast'
import RefreshButton from '../components/common/RefreshButton'
import FilterInput from '../components/common/FilterInput'
import { PaymentForm } from '../types'

type PFType = PaymentForm['type']
const ICON: Record<PFType, string> = { cash: '💵', pix: '📱', card: '💳', boleto: '🧾', transfer: '🔁' }
const TYPE_LABEL: Record<PFType, string> = { cash: 'Dinheiro', pix: 'Pix', card: 'Cartão', boleto: 'Boleto', transfer: 'Transferência' }
const tint = (hex: string) => ({ backgroundColor: `${hex}22`, color: hex })

export default function PaymentMethodsPage() {
  const navigate = useNavigate()
  const company = useAppStore((s) => s.currentCompany)
  const search = useAppStore((s) => s.searchQuery).toLowerCase()
  const role = useAuthStore((s) => s.user?.role)
  const readOnly = isReadOnly(role, 'payment-methods')
  const forms = useDataStore((s) => s.paymentForms)
  const save = useDataStore((s) => s.savePaymentForm)
  const remove = useDataStore((s) => s.removePaymentForm)
  const [filter, setFilter] = useState('')

  const q = filter.toLowerCase()
  const list = forms.filter((f) => f.company_id === company?.id && f.name.toLowerCase().includes(search) && f.name.toLowerCase().includes(q))

  const toggle = (f: PaymentForm) => { save({ ...f, is_active: !f.is_active }); showToast(f.is_active ? 'Forma desativada' : 'Forma ativada', 'success') }
  const del = (f: PaymentForm) => { remove(f.id); showToast('Forma excluída', 'success') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <FilterInput value={filter} onChange={setFilter} placeholder="Filtrar formas..." />
        <div className="flex gap-2">
          <RefreshButton />
          {!readOnly && (
            <button onClick={() => navigate('/payment-methods/new')} className="flex items-center gap-2 bg-primary text-white rounded-md px-4 h-10 font-600 hover:opacity-90">
              <Plus className="w-4 h-4" /> Nova forma
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((f) => (
          <div key={f.id} className="bg-surface border border-border rounded-lg shadow-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ICON[f.type]}</span>
                <div>
                  <p className="font-700 text-text-primary">{f.name}</p>
                  <p className="text-xs text-text-secondary">{TYPE_LABEL[f.type]}</p>
                </div>
              </div>
              {f.is_active
                ? <span className="px-2 py-1 rounded text-xs font-600" style={tint('#1f9d6b')}>Ativa</span>
                : <span className="px-2 py-1 rounded text-xs font-600" style={tint('#8b93a2')}>Inativa</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-background rounded-md p-2"><p className="text-xs text-text-secondary">Taxa</p><p className="mono font-700 text-text-primary">{f.fee_percentage}%</p></div>
              <div className="bg-background rounded-md p-2"><p className="text-xs text-text-secondary">Recebimento</p><p className="mono font-700 text-text-primary">{f.payment_deadline === 0 ? 'Na hora' : `D+${f.payment_deadline}`}</p></div>
            </div>
            {!readOnly && (
              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" checked={f.is_active} onChange={() => toggle(f)} /> Aceitar
                </label>
                <div className="flex gap-1">
                  <button onClick={() => navigate(`/payment-methods/${f.id}`)} className="p-2 rounded hover:bg-background text-text-secondary"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => del(f)} className="p-2 rounded hover:bg-background text-error"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && <p className="text-text-secondary">Nenhuma forma de pagamento.</p>}
      </div>
    </div>
  )
}
