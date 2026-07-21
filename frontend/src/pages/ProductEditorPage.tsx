import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useDataStore, useScopedProducts } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { showToast } from '../components/common/Toast'
import { PriceTier } from '../types'

export default function ProductEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const company = useAppStore((s) => s.currentCompany)
  const groups = useDataStore((s) => s.groups).filter((g) => g.company_id === company?.id)
  const units = useDataStore((s) => s.units).filter((u) => u.company_id === company?.id)
  const products = useScopedProducts(company?.id)
  const saveProduct = useDataStore((s) => s.saveProduct)
  const editing = id ? products.find((p) => p.id === id) : null

  const [form, setForm] = useState({
    name: editing?.name ?? '',
    sku: editing?.sku ?? '',
    group_id: editing?.group_id ?? groups[0]?.id ?? '',
    unit_id: editing?.unit_id ?? units[0]?.id ?? '',
    price: editing?.price ?? 0,
    custo_medio: editing?.custo_medio ?? 0,
    stock: editing?.stock ?? 0,
    min_stock: editing?.min_stock ?? 0,
  })
  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  const [tiers, setTiers] = useState<PriceTier[]>(editing?.price_tiers ?? [])
  const addTier = () => setTiers((t) => [...t, { qty_min: 0, unit_price: 0, label: '' }])
  const setTier = (i: number, patch: Partial<PriceTier>) => setTiers((t) => t.map((x, idx) => (idx === i ? { ...x, ...patch } : x)))
  const removeTier = (i: number) => setTiers((t) => t.filter((_, idx) => idx !== i))

  const save = () => {
    if (!company) return
    if (!form.name.trim()) { showToast('Informe o nome', 'error'); return }
    const price_tiers = tiers.filter((t) => t.qty_min > 0)
    saveProduct({ ...(editing ? { id: editing.id } : {}), ...form, price_tiers, company_id: company.id })
    showToast(editing ? 'Produto atualizado' : 'Produto criado', 'success')
    navigate('/products')
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-600">
          <ArrowLeft className="w-4 h-4" /> Produtos
        </button>
        <h2 className="text-lg font-800 text-text-primary ml-1">{editing ? 'Editar produto' : 'Novo produto'}</h2>
      </div>
      <section className="bg-surface border border-border rounded-lg shadow-card p-6">
        <div className="grid grid-cols-2 gap-3">
          <label className="col-span-2 text-sm">Nome<input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus /></label>
          <label className="text-sm">SKU<input className="input mono" value={form.sku} onChange={(e) => set('sku', e.target.value)} /></label>
          <label className="text-sm">Grupo
            <select className="input" value={form.group_id} onChange={(e) => set('group_id', e.target.value)}>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </label>
          <label className="text-sm">Unidade
            <select className="input" value={form.unit_id} onChange={(e) => set('unit_id', e.target.value)}>
              {units.map((u) => <option key={u.id} value={u.id}>{u.slug}</option>)}
            </select>
          </label>
          <label className="text-sm">Custo médio<input type="number" step="0.01" className="input mono" value={form.custo_medio} onChange={(e) => set('custo_medio', Number(e.target.value))} /></label>
          <label className="text-sm">Preço<input type="number" step="0.01" className="input mono" value={form.price} onChange={(e) => set('price', Number(e.target.value))} /></label>
          <label className="text-sm">Estoque atual<input type="number" className="input mono" value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} /></label>
          <label className="text-sm">Estoque mínimo<input type="number" className="input mono" value={form.min_stock} onChange={(e) => set('min_stock', Number(e.target.value))} /></label>
        </div>

        {/* Faixas de preço por quantidade */}
        <div className="mt-6 border-t border-border pt-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-700 text-text-primary">Faixas de preço por quantidade</h3>
              <p className="text-xs text-text-secondary">Preço/un. aplicado automaticamente conforme a quantidade. O "Preço" acima vale a partir de 1 un.</p>
            </div>
            <button type="button" onClick={addTier} className="flex items-center gap-1 text-sm text-primary font-600"><Plus className="w-4 h-4" /> Faixa</button>
          </div>
          <div className="space-y-2">
            {tiers.map((t, i) => (
              <div key={i} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-text-secondary">A partir de</span>
                <input type="number" step="1" className="input mono w-24" value={t.qty_min} onChange={(e) => setTier(i, { qty_min: Number(e.target.value) })} />
                <span className="text-xs text-text-secondary">un. →</span>
                <input type="number" step="0.01" className="input mono w-28" value={t.unit_price} onChange={(e) => setTier(i, { unit_price: Number(e.target.value) })} />
                <span className="text-xs text-text-secondary">/un.</span>
                <input className="input flex-1 min-w-[140px]" placeholder="Rótulo (ex.: Cento, Meio cento)" value={t.label ?? ''} onChange={(e) => setTier(i, { label: e.target.value })} />
                <button type="button" onClick={() => removeTier(i)} className="text-error p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {tiers.length === 0 && <p className="text-sm text-text-secondary">Sem faixas — usa o preço padrão para qualquer quantidade.</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => navigate('/products')} className="px-4 h-10 rounded-md border border-border text-text-secondary font-600">Cancelar</button>
          <button onClick={save} className="px-5 h-10 rounded-md bg-primary text-white font-600">Salvar</button>
        </div>
      </section>
    </div>
  )
}
