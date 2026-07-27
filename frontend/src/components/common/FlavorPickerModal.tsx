import { useState } from 'react'
import { IceCream } from 'lucide-react'

interface Props {
  productName: string
  flavors: string[]
  onSelect: (flavor: string) => void
  onClose: () => void
}

// Seletor de sabor (listbox) exibido ao adicionar um produto que tem grade de sabores.
export default function FlavorPickerModal({ productName, flavors, onSelect, onClose }: Props) {
  const [sel, setSel] = useState<string>(flavors[0] ?? '')

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface rounded-xl shadow-modal w-full max-w-md p-6 animate-popIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 mb-1 text-primary">
          <IceCream className="w-5 h-5" />
          <h3 className="text-base font-800 text-text-primary">Selecione o sabor</h3>
        </div>
        <p className="text-sm text-text-secondary mb-4">{productName}</p>

        <select
          size={Math.min(Math.max(flavors.length, 3), 8)}
          value={sel}
          onChange={(e) => setSel(e.target.value)}
          onDoubleClick={() => sel && onSelect(sel)}
          onKeyDown={(e) => { if (e.key === 'Enter' && sel) onSelect(sel) }}
          className="w-full border border-border rounded-md bg-surface text-sm text-text-primary p-1 focus:outline-none focus:border-primary"
          autoFocus
        >
          {flavors.map((f) => (
            <option key={f} value={f} className="px-2 py-1.5">{f}</option>
          ))}
        </select>

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 h-10 rounded-md border border-border text-text-secondary font-600">
            Cancelar
          </button>
          <button
            disabled={!sel}
            onClick={() => sel && onSelect(sel)}
            className="flex-1 h-10 rounded-md bg-primary text-white font-600 disabled:opacity-40"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}
