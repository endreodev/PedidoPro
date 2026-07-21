import { useState, useEffect } from 'react'
import { Minus, Plus, Trash2, Check, User, Lock, Unlock, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useDataStore, useScopedProducts } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { useAuthStore } from '../stores/authStore'
import { useCaixaStore, resumoCaixa } from '../stores/caixaStore'
import { showToast } from '../components/common/Toast'
import Autocomplete from '../components/common/Autocomplete'
import { unitPriceForQty } from '../lib/pricing'
import { Product, Customer, PaymentForm } from '../types'

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const tint = (hex: string) => ({ backgroundColor: `${hex}22`, color: hex })
const PAY_MAP: Record<PaymentForm['type'], string> = { cash: 'dinheiro', pix: 'pix', card: 'cartao', boleto: 'boleto', transfer: 'transferencia' }

interface CartLine { product: Product; qty: number }

export default function PDVPage() {
  const company = useAppStore((s) => s.currentCompany)
  const cid = company?.id ?? ''
  const operator = useAuthStore((s) => s.user?.name) ?? 'Operador'
  const role = useAuthStore((s) => s.user?.role)
  const blindClose = role === 'caixa'
  const scopedProducts = useScopedProducts(company?.id)
  const groups = useDataStore((s) => s.groups).filter((g) => g.company_id === cid)
  const customers = useDataStore((s) => s.customers).filter((c) => c.company_id === cid)
  const paymentForms = useDataStore((s) => s.paymentForms).filter((f) => f.company_id === cid && f.is_active)
  const saveOrder = useDataStore((s) => s.saveOrder)
  const adjustStock = useDataStore((s) => s.adjustStock)

  const session = useCaixaStore((s) => s.sessions.find((x) => x.status === 'aberto'))
  const abrir = useCaixaStore((s) => s.abrir)
  const ajuste = useCaixaStore((s) => s.ajuste)
  const fechar = useCaixaStore((s) => s.fechar)
  const registrarVenda = useCaixaStore((s) => s.registrarVenda)
  const aberto = session?.status === 'aberto'

  const [groupId, setGroupId] = useState<string>('all')
  const [cart, setCart] = useState<CartLine[]>([])
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [pickCustomer, setPickCustomer] = useState(false)
  const [pay, setPay] = useState(false)
  const [payMethod, setPayMethod] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  // Caixa
  const [amountModal, setAmountModal] = useState<null | 'abrir' | 'sangria' | 'suprimento'>(null)
  const [amountValue, setAmountValue] = useState('')
  const [amountDesc, setAmountDesc] = useState('')
  const [fecharOpen, setFecharOpen] = useState(false)
  const [countedCash, setCountedCash] = useState('')

  const products = scopedProducts.filter((p) => groupId === 'all' || p.group_id === groupId)
  const lineUnit = (l: CartLine) => unitPriceForQty(l.product, l.qty)
  const total = cart.reduce((s, l) => s + lineUnit(l) * l.qty, 0)
  const customer = customers.find((c) => c.id === customerId)

  const add = (p: Product) => setCart((c) => {
    const found = c.find((l) => l.product.id === p.id)
    return found ? c.map((l) => (l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l)) : [...c, { product: p, qty: 1 }]
  })
  const setQty = (id: string, d: number) => setCart((c) => c.map((l) => (l.product.id === id ? { ...l, qty: Math.max(1, l.qty + d) } : l)))
  const removeLine = (id: string) => setCart((c) => c.filter((l) => l.product.id !== id))

  const confirmPay = () => {
    if (!company || !aberto || !payMethod) return
    const forma = paymentForms.find((f) => f.id === payMethod)
    saveOrder({
      number: String(Math.floor(1000 + total)), customer_id: customerId ?? '', status: 'completed',
      items: cart.map((l, i) => ({ id: `it${i}`, product_id: l.product.id, quantity: l.qty, unit_price: lineUnit(l), subtotal: lineUnit(l) * l.qty })),
      subtotal: total, discount: 0, total, created_at: new Date().toISOString(), company_id: company.id,
    })
    cart.forEach((l) => adjustStock(l.product.id, -l.qty))
    if (forma) registrarVenda(PAY_MAP[forma.type], forma.name, total, `Venda${customer ? ' · ' + customer.name : ''}`)
    setPay(false); setDone(true)
  }
  const newSale = () => { setCart([]); setCustomerId(null); setPayMethod(null); setDone(false) }

  const confirmAmount = () => {
    const v = Number(amountValue) || 0
    if (amountModal === 'abrir') { abrir(v, operator); showToast('Caixa aberto', 'success') }
    else if (amountModal === 'sangria') { ajuste('sangria', v, amountDesc || 'Sangria'); showToast('Sangria registrada', 'success') }
    else if (amountModal === 'suprimento') { ajuste('suprimento', v, amountDesc || 'Suprimento'); showToast('Suprimento registrado', 'success') }
    setAmountModal(null); setAmountValue(''); setAmountDesc('')
  }

  // Atalhos de teclado
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (['F1', 'F2', 'F4', 'F5'].includes(e.key)) e.preventDefault()
      if (e.key === 'F1') { if (!aberto) setAmountModal('abrir') }
      else if (e.key === 'F2') { if (aberto) setPickCustomer(true) }
      else if (e.key === 'F4') { if (aberto && cart.length > 0) setPay(true) }
      else if (e.key === 'F5') { if (pay && payMethod) confirmPay(); else if (aberto && cart.length > 0) setPay(true) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto, cart, pay, payMethod, total, customerId, payMethod])

  const resumo = session ? resumoCaixa(session) : null
  const contado = Number(countedCash) || 0

  return (
    <div className="h-[calc(100vh-110px)] flex flex-col gap-3">
      {/* Barra do caixa */}
      <div className={`flex items-center gap-3 flex-wrap px-4 h-14 rounded-lg border ${aberto ? 'bg-success/10 border-success/30' : 'bg-surface border-border'}`}>
        {aberto ? <Unlock className="w-5 h-5 text-success" /> : <Lock className="w-5 h-5 text-text-secondary" />}
        <div className="text-sm">
          <span className="font-700 text-text-primary">{aberto ? 'Caixa aberto' : 'Caixa fechado'}</span>
          {aberto && session && <span className="text-text-secondary"> · {session.operator} · Abertura {brl(session.openingAmount)} · Vendas {brl(resumo?.totalVendas ?? 0)}</span>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {!aberto && <button onClick={() => setAmountModal('abrir')} className="flex items-center gap-2 bg-primary text-white rounded-md px-4 h-9 font-600"><Unlock className="w-4 h-4" /> Abrir caixa <kbd className="text-xs opacity-80">F1</kbd></button>}
          {aberto && (
            <>
              <button onClick={() => setAmountModal('suprimento')} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"><ArrowUpCircle className="w-4 h-4" /> Suprimento</button>
              <button onClick={() => setAmountModal('sangria')} className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"><ArrowDownCircle className="w-4 h-4" /> Sangria</button>
              <button onClick={() => setFecharOpen(true)} className="flex items-center gap-2 border border-border rounded-md px-4 h-9 font-600 text-text-primary hover:bg-background"><Lock className="w-4 h-4" /> Fechar caixa</button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Produtos */}
        <div className={`flex-1 overflow-y-auto pr-1 ${!aberto ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex gap-2 flex-wrap mb-4">
            <Chip active={groupId === 'all'} onClick={() => setGroupId('all')}>Todos</Chip>
            {groups.map((g) => <Chip key={g.id} active={groupId === g.id} onClick={() => setGroupId(g.id)}>{g.name}</Chip>)}
          </div>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
            {products.map((p) => {
              const g = groups.find((x) => x.id === p.group_id)
              return (
                <button key={p.id} onClick={() => add(p)} className="text-left bg-surface border border-border rounded-md overflow-hidden hover:border-primary hover:shadow-card-md transition-colors">
                  {g && <div className="text-xs font-600 px-3 py-1" style={tint(g.color)}>{g.name}</div>}
                  <div className="p-3">
                    <p className="text-[13px] font-700 text-text-primary leading-tight">{p.name}</p>
                    <p className="mono font-700 mt-1" style={{ color: '#1f9d6b' }}>{brl(p.price)}</p>
                    <p className="text-xs text-text-secondary">Estoque: {p.stock}</p>
                  </div>
                </button>
              )
            })}
            {products.length === 0 && <p className="text-text-secondary">Nenhum produto.</p>}
          </div>
        </div>

        {/* Carrinho */}
        <div className="w-[360px] shrink-0 bg-surface border border-border rounded-lg shadow-card flex flex-col">
          <div className="p-3 border-b border-border">
            {pickCustomer ? (
              <div>
                <Autocomplete<Customer>
                  items={customers}
                  getKey={(c) => c.id}
                  getLabel={(c) => c.name}
                  getSub={(c) => [c.document, c.city].filter(Boolean).join(' · ')}
                  placeholder="Buscar cliente (nome/documento)..."
                  onSelect={(c) => { setCustomerId(c.id); setPickCustomer(false) }}
                  limit={5}
                  autoFocus
                />
                <button onClick={() => { setCustomerId(null); setPickCustomer(false) }} className="mt-1 text-xs text-text-secondary hover:text-text-primary">Consumidor não identificado</button>
              </div>
            ) : (
              <button onClick={() => setPickCustomer(true)} className="w-full flex items-center gap-2 text-left">
                <User className="w-4 h-4 text-text-secondary" />
                <span className="text-sm font-600 text-text-primary flex-1 truncate">{customer?.name ?? 'Consumidor não identificado'}</span>
                <span className="text-xs text-primary">Trocar <kbd className="opacity-70">F2</kbd></span>
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map((l) => (
              <div key={l.product.id} className="flex items-center gap-2">
                <div className="flex-1"><p className="text-sm font-600 text-text-primary">{l.product.name}</p><p className="text-xs text-text-secondary mono">{brl(lineUnit(l))} /un.</p></div>
                <button onClick={() => setQty(l.product.id, -1)} className="w-6 h-6 rounded-full border border-border flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                <span className="mono w-6 text-center">{l.qty}</span>
                <button onClick={() => setQty(l.product.id, 1)} className="w-6 h-6 rounded-full border border-border flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                <span className="mono text-sm w-16 text-right">{brl(lineUnit(l) * l.qty)}</span>
                <button onClick={() => removeLine(l.product.id)} className="text-error"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {cart.length === 0 && <p className="text-sm text-text-secondary text-center mt-8">Carrinho vazio</p>}
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex justify-between text-sm text-text-secondary"><span>Subtotal</span><span className="mono">{brl(total)}</span></div>
            <div className="flex justify-between items-baseline mt-1"><span className="font-700 text-text-primary">Total</span><span className="mono text-2xl font-700" style={{ color: '#1f9d6b' }}>{brl(total)}</span></div>
            <button disabled={cart.length === 0 || !aberto} onClick={() => setPay(true)} className="w-full h-12 mt-3 rounded-md bg-success text-white font-700 disabled:opacity-40 disabled:cursor-not-allowed">
              {aberto ? 'Finalizar venda' : 'Abra o caixa (F1)'} {aberto && <kbd className="opacity-80 ml-1">F5</kbd>}
            </button>
            <p className="text-[11px] text-text-secondary text-center mt-2">Atalhos: F1 abrir caixa · F2 cliente · F4 pagamento · F5 finalizar</p>
          </div>
        </div>
      </div>

      {/* Pagamento */}
      {pay && (
        <Modal onClose={() => setPay(false)} title="Pagamento (F4)">
          <p className="mono text-3xl font-700 text-center mb-4" style={{ color: '#1f9d6b' }}>{brl(total)}</p>
          <div className="grid grid-cols-2 gap-2">
            {paymentForms.map((f) => (
              <button key={f.id} onClick={() => setPayMethod(f.id)} className={`p-3 rounded-md border text-sm font-600 ${payMethod === f.id ? 'border-primary bg-primary/5 text-primary' : 'border-border text-text-primary'}`}>{f.name}</button>
            ))}
            {paymentForms.length === 0 && <p className="col-span-2 text-sm text-text-secondary">Nenhuma forma ativa. Configure em Formas de Pagamento.</p>}
          </div>
          <button disabled={!payMethod} onClick={confirmPay} className="w-full h-11 mt-4 rounded-md bg-success text-white font-700 disabled:opacity-40">Confirmar pagamento (F5)</button>
        </Modal>
      )}

      {/* Sucesso */}
      {done && (
        <Modal onClose={newSale} title="">
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={tint('#1f9d6b')}><Check className="w-8 h-8" /></div>
            <p className="font-800 text-lg text-text-primary mt-4">Venda concluída!</p>
            <button onClick={newSale} className="w-full h-11 mt-4 rounded-md bg-primary text-white font-700">Nova venda</button>
          </div>
        </Modal>
      )}

      {/* Abrir caixa / Sangria / Suprimento */}
      {amountModal && (
        <Modal onClose={() => setAmountModal(null)} title={amountModal === 'abrir' ? 'Abrir caixa (F1)' : amountModal === 'sangria' ? 'Sangria (retirada)' : 'Suprimento (entrada)'}>
          <label className="block text-sm">{amountModal === 'abrir' ? 'Valor de abertura (troco inicial)' : 'Valor'}
            <input type="number" step="0.01" autoFocus className="input mono" value={amountValue} onChange={(e) => setAmountValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmAmount() }} />
          </label>
          {amountModal !== 'abrir' && (
            <label className="block text-sm mt-3">Descrição<input className="input" value={amountDesc} onChange={(e) => setAmountDesc(e.target.value)} /></label>
          )}
          <button onClick={confirmAmount} className="w-full h-11 mt-4 rounded-md bg-primary text-white font-700">Confirmar</button>
        </Modal>
      )}

      {/* Fechar caixa */}
      {fecharOpen && session && resumo && (
        <Modal onClose={() => setFecharOpen(false)} title={blindClose ? 'Fechamento de caixa (às cegas)' : 'Fechamento de caixa — conferência'}>
          {blindClose ? (
            <div className="space-y-3 text-sm">
              <p className="text-text-secondary">Informe o valor apurado em dinheiro na gaveta. A conferência é feita pelo administrador.</p>
              <label className="block">Valor contado em dinheiro
                <input type="number" step="0.01" autoFocus className="input mono" value={countedCash} onChange={(e) => setCountedCash(e.target.value)} />
              </label>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <Row label={`Abertura (${session.operator})`} value={brl(session.openingAmount)} />
              <div className="border-t border-border pt-2">
                <p className="text-xs font-700 text-text-secondary uppercase mb-1">Vendas por forma</p>
                {Object.entries(resumo.porForma).length === 0 && <p className="text-text-secondary">Nenhuma venda.</p>}
                {Object.entries(resumo.porForma).map(([k, v]) => (
                  <Row key={k} label={`${v.name} (${v.qtd})`} value={brl(v.total)} />
                ))}
              </div>
              {resumo.suprimentos > 0 && <Row label="Suprimentos" value={brl(resumo.suprimentos)} />}
              {resumo.sangrias > 0 && <Row label="Sangrias" value={`- ${brl(resumo.sangrias)}`} />}
              <div className="border-t border-border pt-2">
                <Row label="Total de vendas" value={brl(resumo.totalVendas)} bold />
                <Row label="Dinheiro esperado em gaveta" value={brl(resumo.dinheiroEsperado)} bold />
              </div>
              <label className="block pt-2">Valor contado em dinheiro
                <input type="number" step="0.01" className="input mono" value={countedCash} onChange={(e) => setCountedCash(e.target.value)} />
              </label>
              <Row label="Diferença" value={brl(contado - resumo.dinheiroEsperado)}
                valueClass={contado - resumo.dinheiroEsperado === 0 ? 'text-success' : 'text-error'} bold />
            </div>
          )}
          <button onClick={() => { fechar(contado); showToast('Caixa fechado', 'success'); setFecharOpen(false); setCountedCash('') }}
            className="w-full h-11 mt-4 rounded-md bg-primary text-white font-700">Confirmar fechamento</button>
        </Modal>
      )}
    </div>
  )
}

function Row({ label, value, bold, valueClass }: { label: string; value: string; bold?: boolean; valueClass?: string }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? 'font-700 text-text-primary' : 'text-text-secondary'}>{label}</span>
      <span className={`mono ${bold ? 'font-700' : ''} ${valueClass ?? 'text-text-primary'}`}>{value}</span>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`px-3 h-8 rounded-full text-sm font-600 border ${active ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}>{children}</button>
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-xl shadow-modal p-6 w-full max-w-md animate-popIn max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="text-lg font-800 text-text-primary mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  )
}
