import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, CheckCircle, Landmark, X } from 'lucide-react'
import { useFinanceiroStore, Titulo } from '../../stores/financeiroStore'
import { useCaixaStore, resumoCaixa } from '../../stores/caixaStore'
import { useAppStore } from '../../stores/appStore'
import { showToast } from '../../components/common/Toast'
import FilterInput from '../../components/common/FilterInput'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const tint = (hex: string) => ({ backgroundColor: `${hex}22`, color: hex })
const STATUS: Record<Titulo['status'], { label: string; color: string }> = {
  aberto: { label: 'Em aberto', color: '#c47f16' },
  baixado: { label: 'Baixado', color: '#1f9d6b' },
  cancelado: { label: 'Cancelado', color: '#d64545' },
}

export default function TitulosPage() {
  const navigate = useNavigate()
  const company = useAppStore((s) => s.currentCompany)
  const cid = company?.id ?? ''
  const titulos = useFinanceiroStore((s) => s.titulos)
  const contas = useFinanceiroStore((s) => s.contas)
  const removeTitulo = useFinanceiroStore((s) => s.removeTitulo)
  const baixarTitulo = useFinanceiroStore((s) => s.baixarTitulo)
  const gerar = useFinanceiroStore((s) => s.gerarTitulosDoCaixa)
  const sessions = useCaixaStore((s) => s.sessions)

  const [filter, setFilter] = useState('')
  const [tipo, setTipo] = useState<'todos' | 'receber' | 'pagar'>('todos')
  const [gerarOpen, setGerarOpen] = useState(false)

  const q = filter.toLowerCase()
  const list = titulos
    .filter((t) => t.company_id === cid)
    .filter((t) => tipo === 'todos' || t.tipo === tipo)
    .filter((t) => t.descricao.toLowerCase().includes(q))
    .slice().reverse()

  const closedSessions = sessions.filter((s) => s.status === 'fechado')
  const contaReceita = contas.find((c) => c.tipo === 'receita' && c.company_id === cid)?.id

  const doGerar = (sessionId: string) => {
    const s = sessions.find((x) => x.id === sessionId)
    if (!s || !company) return
    const n = gerar(s, company.id, contaReceita)
    showToast(n > 0 ? `${n} título(s) gerado(s)` : 'Caixa já processado', n > 0 ? 'success' : 'info')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <FilterInput value={filter} onChange={setFilter} placeholder="Filtrar títulos..." />
        <div className="flex gap-2">
          <button onClick={() => setGerarOpen(true)} className="flex items-center gap-2 border border-border rounded-md px-4 h-10 font-600 text-text-primary hover:bg-background"><Landmark className="w-4 h-4" /> Gerar do caixa</button>
          <button onClick={() => navigate('/financeiro/titulos/new')} className="flex items-center gap-2 bg-primary text-white rounded-md px-4 h-10 font-600 hover:opacity-90"><Plus className="w-4 h-4" /> Novo título</button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {(['todos', 'receber', 'pagar'] as const).map((t) => (
          <button key={t} onClick={() => setTipo(t)} className={`px-3 h-8 rounded-full text-sm font-600 border capitalize ${tipo === t ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>{t === 'receber' ? 'A receber' : t === 'pagar' ? 'A pagar' : 'Todos'}</button>
        ))}
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-border">
              <th className="p-3 font-600">Descrição</th>
              <th className="p-3 font-600">Tipo</th>
              <th className="p-3 font-600 text-right">Valor</th>
              <th className="p-3 font-600">Vencimento</th>
              <th className="p-3 font-600">Origem</th>
              <th className="p-3 font-600">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0 text-text-primary">
                <td className="p-3 font-600">{t.descricao}</td>
                <td className="p-3"><span className="px-2 py-1 rounded text-xs font-600" style={tint(t.tipo === 'receber' ? '#1f9d6b' : '#d64545')}>{t.tipo === 'receber' ? 'A receber' : 'A pagar'}</span></td>
                <td className="p-3 mono text-right">{brl(t.valor)}</td>
                <td className="p-3 mono">{t.vencimento}</td>
                <td className="p-3 text-text-secondary">{t.origem === 'caixa' ? 'Caixa' : 'Manual'}</td>
                <td className="p-3"><span className="px-2 py-1 rounded text-xs font-600" style={tint(STATUS[t.status].color)}>{STATUS[t.status].label}</span></td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    {t.status === 'aberto' && <button onClick={() => { baixarTitulo(t.id); showToast('Título baixado', 'success') }} title="Baixar" className="p-2 rounded hover:bg-background text-success"><CheckCircle className="w-4 h-4" /></button>}
                    <button onClick={() => { removeTitulo(t.id); showToast('Título excluído', 'success') }} className="p-2 rounded hover:bg-background text-error"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-text-secondary">Nenhum título</td></tr>}
          </tbody>
        </table>
      </div>

      {gerarOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setGerarOpen(false)}>
          <div className="bg-surface rounded-xl shadow-modal p-6 w-full max-w-lg animate-popIn max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-800 text-text-primary">Gerar títulos do caixa</h3>
              <button onClick={() => setGerarOpen(false)} className="text-text-secondary"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-text-secondary mb-3">Selecione um caixa fechado para gerar os títulos (a receber, baixados) por forma de pagamento.</p>
            <div className="space-y-2">
              {closedSessions.length === 0 && <p className="text-sm text-text-secondary">Nenhum caixa fechado.</p>}
              {closedSessions.slice().reverse().map((s) => {
                const r = resumoCaixa(s)
                const jaGerado = titulos.some((t) => t.caixaSessionId === s.id)
                return (
                  <div key={s.id} className="flex items-center justify-between border border-border rounded-md p-3">
                    <div>
                      <p className="text-sm font-600 text-text-primary">{s.operator} · {new Date(s.closedAt ?? s.openedAt).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-text-secondary mono">Vendas {brl(r.totalVendas)}</p>
                    </div>
                    <button disabled={jaGerado} onClick={() => doGerar(s.id)} className="px-3 h-9 rounded-md bg-primary text-white text-sm font-600 disabled:opacity-40">{jaGerado ? 'Gerado' : 'Gerar'}</button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
