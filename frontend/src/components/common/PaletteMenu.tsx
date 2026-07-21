import { useState, useRef, useEffect } from 'react'
import { Palette as PaletteIcon, Check } from 'lucide-react'
import { PALETTES } from '../../theme/palettes'
import { useAppStore } from '../../stores/appStore'

/** Botão + popover de troca rápida de paleta (usado no Header). */
export default function PaletteMenu() {
  const [open, setOpen] = useState(false)
  const palette = useAppStore((s) => s.palette)
  const setPalette = useAppStore((s) => s.setPalette)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Paleta de cores"
        aria-haspopup="menu"
        aria-expanded={open}
        className="w-[38px] h-[38px] bg-background rounded-sm hover:bg-border transition-colors flex items-center justify-center"
      >
        <PaletteIcon className="w-5 h-5 text-text-secondary" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-dropdown p-2 z-40 animate-popIn">
          <p className="px-2 py-1 text-xs font-700 text-text-secondary uppercase tracking-wider">
            Paleta de cores
          </p>
          {PALETTES.map((p) => {
            const active = p.id === palette
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setPalette(p.id)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary font-700'
                    : 'text-text-primary hover:bg-background'
                }`}
              >
                <span className="flex -space-x-1.5 shrink-0">
                  {p.swatches.map((c, i) => (
                    <span
                      key={i}
                      className="w-4 h-4 rounded-full border-2 border-surface"
                      style={{ background: c }}
                    />
                  ))}
                </span>
                <span className="flex-1 text-left">{p.name}</span>
                {active && <Check className="w-4 h-4 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
