import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { showToast } from '../components/common/Toast'

export default function UnitEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const company = useAppStore((s) => s.currentCompany)
  const units = useDataStore((s) => s.units)
  const saveUnit = useDataStore((s) => s.saveUnit)
  const editing = id ? units.find((u) => u.id === id) : null

  const [slug, setSlug] = useState(editing?.slug ?? '')
  const [description, setDescription] = useState(editing?.description ?? '')

  const save = () => {
    if (!company) return
    if (!slug.trim()) { showToast('Informe a sigla', 'error'); return }
    saveUnit({ id: editing?.id ?? slug.trim().toUpperCase(), slug: slug.trim().toUpperCase(), description: description.trim(), company_id: company.id })
    showToast(editing ? 'Unidade atualizada' : 'Unidade criada', 'success')
    navigate('/units')
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/units')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-600">
          <ArrowLeft className="w-4 h-4" /> Unidades
        </button>
        <h2 className="text-lg font-800 text-text-primary ml-1">{editing ? 'Editar unidade' : 'Nova unidade'}</h2>
      </div>
      <section className="bg-surface border border-border rounded-lg shadow-card p-6 space-y-4">
        <label className="block text-sm">Sigla<input className="input mono uppercase" maxLength={6} value={slug} onChange={(e) => setSlug(e.target.value.toUpperCase())} autoFocus /></label>
        <label className="block text-sm">Descrição<input className="input" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => navigate('/units')} className="px-4 h-10 rounded-md border border-border text-text-secondary font-600">Cancelar</button>
          <button onClick={save} className="px-5 h-10 rounded-md bg-primary text-white font-600">Salvar</button>
        </div>
      </section>
    </div>
  )
}
