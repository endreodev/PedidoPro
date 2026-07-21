import { X } from 'lucide-react'
import { useDataStore } from '../../stores/dataStore'
import { createCustomer } from '../../api/customers'
import { showToast } from '../common/Toast'
import CustomerForm from './CustomerForm'
import { Customer } from '../../types'

/** Modal de cadastro de cliente — usado no lançamento de pedido (não sai da tela). */
export default function CustomerFormModal({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Partial<Customer>
  onClose: () => void
  onSaved: (c: Customer) => void
}) {
  const hydrate = useDataStore((s) => s.hydrate)

  const handleSubmit = async (c: Customer) => {
    try {
      const created = await createCustomer(c) // id real do banco (CODPARC)
      hydrate()
      showToast('Cliente criado', 'success')
      onSaved(created)
    } catch {
      showToast('Falha ao criar cliente', 'error')
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-xl shadow-modal p-6 w-full max-w-2xl animate-popIn max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-800 text-text-primary">Novo cliente</h3>
          <button onClick={onClose} className="text-text-secondary"><X className="w-5 h-5" /></button>
        </div>
        <CustomerForm
          initial={initial}
          onCancel={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
