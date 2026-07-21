import { useDataStore, useScopedProducts } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function DashboardPage() {
  const company = useAppStore((s) => s.currentCompany)
  const cid = company?.id ?? ''
  const orders = useDataStore((s) => s.orders).filter((o) => o.company_id === cid)
  const customers = useDataStore((s) => s.customers).filter((c) => c.company_id === cid)
  const products = useScopedProducts(company?.id)

  const done = orders.filter((o) => o.status === 'completed')
  const revenue = done.reduce((s, o) => s + o.total, 0)
  const ticket = done.length ? revenue / done.length : 0
  const openOrders = orders.filter((o) => o.status === 'open' || o.status === 'separating')
  const lowStock = products.filter((p) => p.stock <= p.min_stock)
  const healthy = products.filter((p) => p.stock > p.min_stock).length
  const healthPct = products.length ? Math.round((healthy / products.length) * 100) : 0

  const kpis = [
    { label: 'Faturamento', value: brl(revenue) },
    { label: 'Pedidos', value: String(orders.length) },
    { label: 'Ticket médio', value: brl(ticket) },
    { label: 'Clientes', value: String(customers.length) },
    { label: 'Produtos', value: String(products.length) },
  ]

  const colHeader = (dot: string, title: string, n: number) => (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: dot }} />
      <h3 className="font-700 text-text-primary">{title}</h3>
      <span className="ml-auto text-xs bg-surface border border-border rounded-full px-2 py-0.5 text-text-secondary">{n}</span>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((k) => (
          <div key={k.label} className="bg-surface border border-border rounded-lg shadow-card p-4">
            <p className="text-xs text-text-secondary">{k.label}</p>
            <p className="mono text-2xl font-700 text-text-primary mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="bg-background rounded-lg p-4">
          {colHeader('#5865f2', 'Indicadores', 1)}
          <div className="bg-surface border border-border rounded-md shadow-card p-3">
            <p className="text-sm font-600 text-text-primary">Saúde do estoque</p>
            <p className="mono text-xl font-700 text-text-primary my-1">{healthPct}%</p>
            <div className="h-2 rounded-full bg-border overflow-hidden"><div className="h-full bg-success" style={{ width: `${healthPct}%` }} /></div>
            <p className="text-xs text-text-secondary mt-2">{healthy} de {products.length} produtos acima do mínimo</p>
          </div>
        </div>

        <div className="bg-background rounded-lg p-4">
          {colHeader('#3a7bd5', 'Operação', openOrders.length)}
          <div className="space-y-2">
            {openOrders.map((o) => {
              const c = customers.find((x) => x.id === o.customer_id)
              return (
                <div key={o.id} className="bg-surface border border-border rounded-md shadow-card p-3 flex items-center justify-between">
                  <div><span className="mono text-primary font-700">#{o.number}</span> <span className="text-sm text-text-secondary">{c?.name ?? 'Consumidor'}</span></div>
                  <span className="mono font-700 text-text-primary">{brl(o.total)}</span>
                </div>
              )
            })}
            {openOrders.length === 0 && <p className="text-sm text-text-secondary">Nenhum pedido em aberto</p>}
          </div>
        </div>

        <div className="bg-background rounded-lg p-4">
          {colHeader('#c47f16', 'Acompanhar', lowStock.length)}
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.id} className="bg-surface border border-border rounded-md shadow-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: p.stock <= p.min_stock * 0.5 ? '#d64545' : '#c47f16' }} />
                  <span className="text-sm text-text-primary">{p.name}</span>
                </div>
                <span className="mono font-700 text-text-primary">{p.stock}</span>
              </div>
            ))}
            {lowStock.length === 0 && <p className="text-sm text-text-secondary">Estoque saudável</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
