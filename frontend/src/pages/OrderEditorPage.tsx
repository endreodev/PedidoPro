import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2, User, Package, CreditCard, Plus, FileText } from 'lucide-react'
import { useDataStore, useScopedProducts } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { showToast } from '../components/common/Toast'
import Autocomplete from '../components/common/Autocomplete'
import CustomerFormModal from '../components/customers/CustomerFormModal'
import { unitPriceForQty } from '../lib/pricing'
import { Order, OrderItem, OrderPayment, Customer, Product } from '../types'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
type Status = Order['status']
const STATUS: { key: Status; label: string }[] = [
  { key: 'orcamento', label: 'Orçamento' }, { key: 'draft', label: 'Rascunho' }, { key: 'open', label: 'Em aberto' },
  { key: 'separating', label: 'Em separação' }, { key: 'completed', label: 'Concluído' }, { key: 'canceled', label: 'Cancelado' },
]

export default function OrderEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const company = useAppStore((s) => s.currentCompany)
  const cid = company?.id ?? ''
  const customers = useDataStore((s) => s.customers).filter((c) => c.company_id === cid)
  const products = useScopedProducts(company?.id)
  const paymentForms = useDataStore((s) => s.paymentForms).filter((f) => f.company_id === cid && f.is_active)
  const orders = useDataStore((s) => s.orders)
  const saveOrder = useDataStore((s) => s.saveOrder)

  const editing = id ? orders.find((o) => o.id === id) : null

  const [customerId, setCustomerId] = useState(editing?.customer_id ?? '')
  const [status, setStatus] = useState<Status>(editing?.status ?? 'open')
  const [items, setItems] = useState<OrderItem[]>(editing?.items ?? [])
  const [payments, setPayments] = useState<OrderPayment[]>(editing?.payments ?? [])
  const [newCustomerName, setNewCustomerName] = useState<string | null>(null)

  const customer = customers.find((c) => c.id === customerId)
  const total = items.reduce((s, i) => s + i.subtotal, 0)
  const totalPago = payments.reduce((s, p) => s + p.amount, 0)
  const restante = total - totalPago

  const addPayment = () => setPayments((ps) => [...ps, { id: `pg${ps.length}`, payment_form_id: paymentForms[0]?.id ?? '', amount: Math.max(0, restante) }])
  const setPayment = (idx: number, patch: Partial<OrderPayment>) => setPayments((ps) => ps.map((p, i) => (i === idx ? { ...p, ...patch } : p)))
  const removePayment = (idx: number) => setPayments((ps) => ps.filter((_, i) => i !== idx))

  // Recalcula o preço unitário pela faixa de quantidade do produto.
  const reprice = (i: OrderItem, qty: number): OrderItem => {
    const p = products.find((x) => x.id === i.product_id)
    const q = Math.max(1, qty || 1)
    const up = p ? unitPriceForQty(p, q) : i.unit_price
    return { ...i, quantity: q, unit_price: up, subtotal: q * up }
  }
  // Sempre cria uma nova linha (permite o mesmo produto várias vezes). Ações operam por id da linha.
  const lineId = () => 'it' + Math.random().toString(36).slice(2, 9)
  const addProduct = (p: Product) => setItems((its) => {
    const up = unitPriceForQty(p, 1)
    return [...its, { id: lineId(), product_id: p.id, quantity: 1, unit_price: up, subtotal: up }]
  })
  const setQty = (id: string, qty: number) => setItems((its) => its.map((i) => (i.id === id ? reprice(i, qty) : i)))
  const bump = (id: string, d: number) => setItems((its) => its.map((i) => (i.id === id ? reprice(i, i.quantity + d) : i)))
  const removeItem = (id: string) => setItems((its) => its.filter((i) => i.id !== id))

  const save = (overrideStatus?: Status) => {
    if (!company) return
    if (items.length === 0) { showToast('Adicione ao menos um produto', 'error'); return }
    const st = overrideStatus ?? status
    const nextNumber = editing?.number ?? String(1000 + orders.filter((o) => o.company_id === cid).length + 1)
    saveOrder({
      ...(editing ? { id: editing.id } : {}),
      number: nextNumber, customer_id: customerId, status: st, items, payments,
      subtotal: total, discount: 0, total, created_at: editing?.created_at ?? '2026-07-15T12:00:00Z',
      company_id: company.id,
    })
    showToast(st === 'orcamento' ? 'Orçamento salvo' : (editing ? 'Pedido atualizado' : 'Pedido criado'), 'success')
    navigate('/orders')
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-600">
          <ArrowLeft className="w-4 h-4" /> Pedidos
        </button>
        <h2 className="text-lg font-800 text-text-primary ml-1">{editing ? `Pedido #${editing.number}` : 'Novo pedido'}</h2>
        <div className="ml-auto flex items-center gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="h-10 px-3 rounded-md border border-border bg-surface text-sm text-text-primary">
            {STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <button onClick={() => save('orcamento')} className="flex items-center gap-2 border border-border text-text-primary rounded-md px-4 h-10 font-600 hover:bg-background" title="Salva como negociação, não vira venda"><FileText className="w-4 h-4" /> Salvar orçamento</button>
          <button onClick={() => save()} className="bg-primary text-white rounded-md px-5 h-10 font-600 hover:opacity-90">Salvar pedido</button>
        </div>
      </div>

      {/* Cabeçalho: Cliente */}
      <section className="bg-surface border border-border rounded-lg shadow-card p-5">
        <div className="flex items-center gap-2 mb-3 text-text-secondary"><User className="w-4 h-4" /><h3 className="text-sm font-700 uppercase tracking-wide">Cliente</h3></div>
        {customer ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-700 text-text-primary">{customer.name}</p>
              <p className="text-sm text-text-secondary">
                {[customer.document, customer.phone, customer.city].filter(Boolean).join(' · ') || 'Sem dados adicionais'}
              </p>
            </div>
            <button onClick={() => setCustomerId('')} className="text-sm text-primary font-600">Trocar</button>
          </div>
        ) : (
          <div className="space-y-2">
            <Autocomplete<Customer>
              items={customers}
              getKey={(c) => c.id}
              getLabel={(c) => c.name}
              getSub={(c) => [c.document, c.city].filter(Boolean).join(' · ')}
              placeholder="Buscar cliente por nome/documento..."
              onSelect={(c) => setCustomerId(c.id)}
              onCreateNew={(name) => setNewCustomerName(name)}
            />
            <p className="text-xs text-text-secondary">Vazio = Consumidor não identificado. Digite um nome novo para criar o cliente.</p>
          </div>
        )}
      </section>

      {/* Produtos */}
      <section className="bg-surface border border-border rounded-lg shadow-card p-5">
        <div className="flex items-center gap-2 mb-3 text-text-secondary"><Package className="w-4 h-4" /><h3 className="text-sm font-700 uppercase tracking-wide">Produtos</h3></div>
        <Autocomplete<Product>
          items={products}
          getKey={(p) => p.id}
          getLabel={(p) => p.name}
          getSub={(p) => p.sku}
          getRight={(p) => brl(p.price)}
          placeholder="Buscar produto e adicionar (Enter)..."
          onSelect={addProduct}
          clearOnSelect
          autoFocus
        />

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-border">
                <th className="py-2 font-600">Produto</th>
                <th className="py-2 font-600 text-right">Preço un.</th>
                <th className="py-2 font-600 text-center">Qtd</th>
                <th className="py-2 font-600 text-right">Subtotal</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => {
                const p = products.find((x) => x.id === i.product_id)
                return (
                  <tr key={i.id} className="border-b border-border last:border-0">
                    <td className="py-2 text-text-primary">{p?.name ?? i.product_id}</td>
                    <td className="py-2 mono text-right text-text-secondary">{brl(i.unit_price)}</td>
                    <td className="py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => bump(i.id, -1)} className="w-6 h-6 rounded-full border border-border">-</button>
                        <input type="number" min={1} value={i.quantity} onChange={(e) => setQty(i.id, Number(e.target.value))}
                          className="w-14 h-8 text-center mono rounded border border-border bg-surface" />
                        <button onClick={() => bump(i.id, 1)} className="w-6 h-6 rounded-full border border-border">+</button>
                      </div>
                    </td>
                    <td className="py-2 mono text-right text-text-primary">{brl(i.subtotal)}</td>
                    <td className="py-2 text-right"><button onClick={() => removeItem(i.id)} className="text-error"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                )
              })}
              {items.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-text-secondary">Busque um produto acima para começar</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-border">
          <span className="text-text-secondary">Total</span>
          <span className="mono text-2xl font-700" style={{ color: '#1f9d6b' }}>{brl(total)}</span>
        </div>
      </section>

      {/* Formas de pagamento (múltiplas) */}
      <section className="bg-surface border border-border rounded-lg shadow-card p-5">
        <div className="flex items-center gap-2 mb-3 text-text-secondary"><CreditCard className="w-4 h-4" /><h3 className="text-sm font-700 uppercase tracking-wide">Formas de pagamento</h3></div>
        <div className="space-y-2">
          {payments.map((pg, idx) => (
            <div key={pg.id} className="flex items-center gap-2">
              <select value={pg.payment_form_id} onChange={(e) => setPayment(idx, { payment_form_id: e.target.value })} className="input flex-1">
                {paymentForms.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <input type="number" step="0.01" value={pg.amount} onChange={(e) => setPayment(idx, { amount: Number(e.target.value) })} className="input mono w-40" placeholder="Valor" />
              <button onClick={() => removePayment(idx)} className="text-error p-2"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {payments.length === 0 && <p className="text-sm text-text-secondary">Nenhuma forma adicionada. Opcional para orçamento.</p>}
        </div>
        <button onClick={addPayment} disabled={paymentForms.length === 0} className="mt-3 flex items-center gap-2 text-sm text-primary font-600 disabled:opacity-40"><Plus className="w-4 h-4" /> Adicionar forma de pagamento</button>
        <div className="flex items-center justify-end gap-6 mt-4 pt-4 border-t border-border text-sm">
          <span className="text-text-secondary">Total pago <span className="mono text-text-primary">{brl(totalPago)}</span></span>
          <span className="text-text-secondary">Restante <span className="mono font-700" style={{ color: Math.abs(restante) < 0.01 ? '#1f9d6b' : '#c47f16' }}>{brl(restante)}</span></span>
        </div>
      </section>

      {newCustomerName !== null && (
        <CustomerFormModal
          initial={{ name: newCustomerName }}
          onClose={() => setNewCustomerName(null)}
          onSaved={(c) => setCustomerId(c.id)}
        />
      )}
    </div>
  )
}
