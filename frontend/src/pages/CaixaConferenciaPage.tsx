import { useState } from 'react'
import { Unlock, Lock } from 'lucide-react'
import { useCaixaStore, resumoCaixa, CaixaSession } from '../stores/caixaStore'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const tint = (hex: string) => ({ backgroundColor: `${hex}22`, color: hex })
const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('pt-BR') : '—')
const kindLabel: Record<string, string> = { venda: 'Venda', suprimento: 'Suprimento', sangria: 'Sangria' }

function SessionCard({ s }: { s: CaixaSession }) {
  const r = resumoCaixa(s)
  const contado = s.countedCash ?? 0
  const diff = contado - r.dinheiroEsperado
  const aberto = s.status === 'aberto'

  return (
    <div className="bg-surface border border-border rounded-lg shadow-card p-5 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        {aberto ? <Unlock className="w-5 h-5 text-success" /> : <Lock className="w-5 h-5 text-text-secondary" />}
        <div>
          <p className="font-700 text-text-primary">{s.operator}</p>
          <p className="text-xs text-text-secondary">Aberto: {fmt(s.openedAt)}{!aberto && ` · Fechado: ${fmt(s.closedAt)}`}</p>
        </div>
        <span className="ml-auto px-2 py-1 rounded text-xs font-600" style={tint(aberto ? '#1f9d6b' : '#8b93a2')}>{aberto ? 'Aberto' : 'Fechado'}</span>
      </div>

      {/* Totais por forma de pagamento */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-border">
              <th className="py-2 font-600">Forma de pagamento</th>
              <th className="py-2 font-600 text-center">Qtd operações</th>
              <th className="py-2 font-600 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(r.porForma).map(([k, v]) => (
              <tr key={k} className="border-b border-border last:border-0 text-text-primary">
                <td className="py-2">{v.name}</td>
                <td className="py-2 text-center mono">{v.qtd}</td>
                <td className="py-2 text-right mono">{brl(v.total)}</td>
              </tr>
            ))}
            {Object.keys(r.porForma).length === 0 && <tr><td colSpan={3} className="py-3 text-text-secondary">Nenhuma venda</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Conferência de dinheiro */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
        <Stat label="Abertura" value={brl(s.openingAmount)} />
        <Stat label="Total vendas" value={brl(r.totalVendas)} />
        <Stat label="Dinheiro esperado" value={brl(r.dinheiroEsperado)} />
        <Stat label="Contado" value={aberto ? '—' : brl(contado)} />
        <Stat label="Diferença" value={aberto ? '—' : brl(diff)} color={aberto ? undefined : diff === 0 ? '#1f9d6b' : '#d64545'} />
      </div>

      {/* Todas as operações */}
      <details>
        <summary className="cursor-pointer text-sm text-primary font-600">Ver todas as operações ({s.movements.length})</summary>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-border">
                <th className="py-2 font-600">Hora</th>
                <th className="py-2 font-600">Tipo</th>
                <th className="py-2 font-600">Forma</th>
                <th className="py-2 font-600">Descrição</th>
                <th className="py-2 font-600 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {s.movements.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 text-text-primary">
                  <td className="py-2 mono text-text-secondary">{new Date(m.at).toLocaleTimeString('pt-BR')}</td>
                  <td className="py-2">{kindLabel[m.kind] ?? m.kind}</td>
                  <td className="py-2">{m.paymentName}</td>
                  <td className="py-2 text-text-secondary">{m.description}</td>
                  <td className="py-2 text-right mono">{m.kind === 'sangria' ? `- ${brl(m.amount)}` : brl(m.amount)}</td>
                </tr>
              ))}
              {s.movements.length === 0 && <tr><td colSpan={5} className="py-3 text-text-secondary">Nenhuma operação</td></tr>}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-background rounded-md p-2">
      <p className="text-xs text-text-secondary">{label}</p>
      <p className="mono font-700" style={color ? { color } : undefined}>{value}</p>
    </div>
  )
}

export default function CaixaConferenciaPage() {
  const sessions = useCaixaStore((s) => s.sessions)
  const [date, setDate] = useState('')
  const [status, setStatus] = useState<'todos' | 'aberto' | 'fechado'>('todos')

  const list = sessions
    .filter((s) => !date || s.openedAt.slice(0, 10) === date)
    .filter((s) => status === 'todos' || s.status === status)
    .slice()
    .reverse()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm text-text-secondary flex items-center gap-2">
          Data
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 px-3 rounded-md border border-border bg-surface text-sm text-text-primary" />
        </label>
        {date && <button onClick={() => setDate('')} className="text-sm text-primary">limpar</button>}
        <div className="flex items-center gap-2 ml-auto">
          {(['todos', 'aberto', 'fechado'] as const).map((st) => (
            <button key={st} onClick={() => setStatus(st)} className={`px-3 h-8 rounded-full text-sm font-600 border capitalize ${status === st ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>{st}</button>
          ))}
        </div>
      </div>

      {list.length === 0 && (
        <div className="bg-surface border border-border rounded-lg shadow-card p-10 text-center text-text-secondary">
          Nenhum caixa no filtro selecionado.
        </div>
      )}
      {list.map((s) => <SessionCard key={s.id} s={s} />)}
    </div>
  )
}
