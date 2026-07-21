import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import { showToast } from '../components/common/Toast'
import CustomerForm from '../components/customers/CustomerForm'

export default function CustomerEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const customers = useDataStore((s) => s.customers)
  const saveCustomer = useDataStore((s) => s.saveCustomer)
  const editing = id ? customers.find((c) => c.id === id) : null

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-600">
          <ArrowLeft className="w-4 h-4" /> Clientes
        </button>
        <h2 className="text-lg font-800 text-text-primary ml-1">{editing ? 'Editar cliente' : 'Novo cliente'}</h2>
      </div>
      <section className="bg-surface border border-border rounded-lg shadow-card p-6">
        <CustomerForm
          initial={editing ?? undefined}
          onCancel={() => navigate('/customers')}
          onSubmit={(c) => { saveCustomer(c); showToast('Cliente salvo', 'success'); navigate('/customers') }}
        />
      </section>
    </div>
  )
}
