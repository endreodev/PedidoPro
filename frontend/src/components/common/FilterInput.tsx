import { Search } from 'lucide-react'

/** Campo de filtro/busca padrão das telas com grid. */
export default function FilterInput({
  value,
  onChange,
  placeholder = 'Filtrar...',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-surface text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
      />
    </div>
  )
}
