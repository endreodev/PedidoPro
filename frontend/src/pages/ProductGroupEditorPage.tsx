import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { showToast } from '../components/common/Toast'

const PALETTE = ['#4b57d6', '#1f9d6b', '#d98a24', '#c2557a', '#2f9e8f', '#7d5bd6', '#d64545', '#3a7bd5']

export default function ProductGroupEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const company = useAppStore((s) => s.currentCompany)
  const groups = useDataStore((s) => s.groups)
  const saveGroup = useDataStore((s) => s.saveGroup)
  const editing = id ? groups.find((g) => g.id === id) : null

  const [name, setName] = useState(editing?.name ?? '')
  const [color, setColor] = useState(editing?.color ?? PALETTE[0])

  const save = () => {
    if (!company) return
    if (!name.trim()) { showToast('Informe o nome', 'error'); return }
    saveGroup({ ...(editing ? { id: editing.id } : {}), name: name.trim(), color, company_id: company.id })
    showToast(editing ? 'Grupo atualizado' : 'Grupo criado', 'success')
    navigate('/product-groups')
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/product-groups')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-600">
          <ArrowLeft className="w-4 h-4" /> Grupos de Produtos
        </button>
        <h2 className="text-lg font-800 text-text-primary ml-1">{editing ? 'Editar grupo' : 'Novo grupo'}</h2>
      </div>
      <section className="bg-surface border border-border rounded-lg shadow-card p-6 space-y-4">
        <label className="block text-sm">Nome<input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></label>
        <div>
          <p className="text-sm text-text-secondary mb-2">Cor</p>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-md ${color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : ''}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => navigate('/product-groups')} className="px-4 h-10 rounded-md border border-border text-text-secondary font-600">Cancelar</button>
          <button onClick={save} className="px-5 h-10 rounded-md bg-primary text-white font-600">Salvar</button>
        </div>
      </section>
    </div>
  )
}
