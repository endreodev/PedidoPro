import { IceCream } from 'lucide-react'

interface Props {
  productName: string
  flavors: string[]
  onSelect: (flavor: string) => void
  onClose: () => void
}

// Seletor de sabor exibido ao adicionar um produto que tem grade de sabores.
export default function FlavorPickerModal({ productName, flavors, onSelect, onClose }: Props) {
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

        <div className="grid grid-cols-2 gap-2">
          {flavors.map((f) => (
            <button
              key={f}
              onClick={() => onSelect(f)}
              className="p-3 rounded-md border border-border text-sm font-600 text-text-primary hover:border-primary hover:bg-primary/5 transition-colors text-left"
            >
              {f}
            </button>
          ))}
        </div>

        <button onClick={onClose} className="w-full mt-4 h-10 rounded-md border border-border text-text-secondary font-600">
          Cancelar
        </button>
      </div>
    </div>
  )
}
