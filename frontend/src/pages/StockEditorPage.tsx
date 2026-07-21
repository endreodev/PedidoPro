import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useDataStore, useScopedProducts } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { showToast } from '../components/common/Toast'

export default function StockEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const company = useAppStore((s) => s.currentCompany)
  const products = useScopedProducts(company?.id)
  const saveProduct = useDataStore((s) => s.saveProduct)
  const product = products.find((p) => p.id === id)

  const [stock, setStock] = useState(product?.stock ?? 0)
  const [minStock, setMinStock] = useState(product?.min_stock ?? 0)

  if (!product) {
    return (
      <div className="max-w-lg space-y-4">
        <button onClick={() => navigate('/stock-control')} className="flex items-center gap-2 text-text-secondary font-600"><ArrowLeft className="w-4 h-4" /> Controle de Estoque</button>
        <p className="text-text-secondary">Produto não encontrado.</p>
      </div>
    )
  }

  const save = () => {
    if (!company) return
    saveProduct({ ...product, stock, min_stock: minStock })
    showToast('Estoque atualizado', 'success')
    navigate('/stock-control')
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/stock-control')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-600">
          <ArrowLeft className="w-4 h-4" /> Controle de Estoque
        </button>
        <h2 className="text-lg font-800 text-text-primary ml-1">Ajustar estoque</h2>
      </div>
      <section className="bg-surface border border-border rounded-lg shadow-card p-6 space-y-4">
        <div>
          <p className="font-700 text-text-primary">{product.name}</p>
          <p className="text-sm text-text-secondary mono">{product.sku}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">Estoque atual<input type="number" className="input mono" value={stock} onChange={(e) => setStock(Number(e.target.value))} autoFocus /></label>
          <label className="block text-sm">Estoque mínimo<input type="number" className="input mono" value={minStock} onChange={(e) => setMinStock(Number(e.target.value))} /></label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => navigate('/stock-control')} className="px-4 h-10 rounded-md border border-border text-text-secondary font-600">Cancelar</button>
          <button onClick={save} className="px-5 h-10 rounded-md bg-primary text-white font-600">Salvar</button>
        </div>
      </section>
    </div>
  )
}
