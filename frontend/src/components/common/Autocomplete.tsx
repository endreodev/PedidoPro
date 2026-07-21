import { useState, useRef, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'

interface Props<T> {
  items: T[]
  getKey: (t: T) => string
  getLabel: (t: T) => string
  getSub?: (t: T) => string
  getRight?: (t: T) => string
  placeholder?: string
  onSelect: (t: T) => void
  onCreateNew?: (query: string) => void
  clearOnSelect?: boolean
  autoFocus?: boolean
  limit?: number
}

export default function Autocomplete<T>({
  items, getKey, getLabel, getSub, getRight, placeholder,
  onSelect, onCreateNew, clearOnSelect, autoFocus, limit = 8,
}: Props<T>) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const MIN_CHARS = 3
  const query = q.trim().toLowerCase()
  const enough = query.length >= MIN_CHARS
  const filtered = enough
    ? items.filter((t) => `${getLabel(t)} ${getSub?.(t) ?? ''}`.toLowerCase().includes(query)).slice(0, limit)
    : []

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const pick = (t: T) => {
    onSelect(t)
    setOpen(false)
    setHi(0)
    if (clearOnSelect) { setQ(''); inputRef.current?.focus() } else { setQ('') }
  }

  const create = () => {
    if (onCreateNew && q.trim()) { onCreateNew(q.trim()); setQ(''); setOpen(false) }
  }

  const canCreate = onCreateNew && enough && !filtered.some((t) => getLabel(t).toLowerCase() === query)

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHi((h) => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[hi]) pick(filtered[hi])
      else if (canCreate) create()
    } else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
      <input
        ref={inputRef}
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setHi(0) }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder={placeholder}
        className="input"
        style={{ paddingLeft: '2.25rem' }}
      />
      {open && q.trim().length > 0 && !enough && (
        <div className="absolute z-40 mt-1 w-full bg-surface border border-border rounded-lg shadow-dropdown px-3 py-2 text-xs text-text-secondary">
          Digite ao menos {MIN_CHARS} caracteres para buscar
        </div>
      )}
      {open && enough && (filtered.length > 0 || canCreate) && (
        <div className="absolute z-40 mt-1 w-full bg-surface border border-border rounded-lg shadow-dropdown max-h-64 overflow-y-auto">
          {filtered.map((t, i) => (
            <button
              key={getKey(t)}
              type="button"
              onMouseEnter={() => setHi(i)}
              onClick={() => pick(t)}
              className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 ${i === hi ? 'bg-primary/10' : ''}`}
            >
              <span className="min-w-0">
                <span className="block text-sm font-600 text-text-primary truncate">{getLabel(t)}</span>
                {getSub && <span className="block text-xs text-text-secondary truncate">{getSub(t)}</span>}
              </span>
              {getRight && <span className="mono text-sm text-text-secondary shrink-0">{getRight(t)}</span>}
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onClick={create}
              className="w-full text-left px-3 py-2 text-primary text-sm border-t border-border flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Criar &quot;{q.trim()}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
