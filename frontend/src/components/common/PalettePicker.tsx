import { Check } from 'lucide-react'
import { PALETTES } from '../../theme/palettes'
import { useAppStore } from '../../stores/appStore'

/** Grade de seleção de paleta (usada na tela de Configurações). */
export default function PalettePicker() {
  const palette = useAppStore((s) => s.palette)
  const setPalette = useAppStore((s) => s.setPalette)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {PALETTES.map((p) => {
        const active = p.id === palette
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => setPalette(p.id)}
            aria-pressed={active}
            className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
              active
                ? 'border-primary ring-1 ring-primary/30 bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <span className="flex -space-x-1.5 shrink-0">
              {p.swatches.map((c, i) => (
                <span
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-surface"
                  style={{ background: c }}
                />
              ))}
            </span>
            <span className="flex-1 text-sm font-600 text-text-primary">{p.name}</span>
            {active && <Check className="w-4 h-4 text-primary shrink-0" />}
          </button>
        )
      })}
    </div>
  )
}
