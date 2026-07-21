import { create } from 'zustand'
import {
  Company, Customer, Product, ProductGroup, Unit,
  PaymentForm, Order, UserInCompany, Parametro,
} from '../types'
import { listProducts, createProduct, updateProduct, deleteProduct } from '../api/products'
import { listGroups, createGroup, updateGroup, deleteGroup } from '../api/groups'
import { listUnits, createUnit, updateUnit, deleteUnit } from '../api/units'
import { listPaymentForms, createPaymentForm, updatePaymentForm, deletePaymentForm } from '../api/paymentForms'
import { listParametros, updateParametro } from '../api/parametros'
import { listUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../api/usuarios'
import { listCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customers'
import { listOrders, createOrder, updateOrder, deleteOrder } from '../api/orders'

// company_id vazio = produto compartilhado entre filiais (parâmetro COMPARTILHA_PRODUTO_FILIAIS).
export const SHARED = ''

export const SEED_COMPANIES: Company[] = [
  { id: '1', name: 'Loja Matriz', cnpj: '11.111.111/0001-11', branch: 'varejo', color: '#4b57d6' },
  { id: '2', name: 'Filial Centro', cnpj: '22.222.222/0001-22', branch: 'alimentacao', color: '#1f9d6b' },
]

// Produtos, grupos e unidades vêm do banco via hydrate() — sem seed local.
const SEED_PRODUCTS: Product[] = []

// Pedidos ainda em memória (mock) — próximo lote liga ao banco.
const SEED_ORDERS: Order[] = []

interface DataStore {
  customers: Customer[]
  products: Product[]
  groups: ProductGroup[]
  units: Unit[]
  paymentForms: PaymentForm[]
  orders: Order[]
  users: UserInCompany[]
  parametros: Parametro[]

  // Carrega dados reais do banco (produtos) para a empresa ativa.
  hydrate: () => void

  // Selectors escopados por empresa
  productsFor: (companyId: string) => Product[]
  getParam: (chave: string) => string | undefined

  // CRUD — cria com id automático quando ausente
  saveCustomer: (data: Partial<Customer> & { company_id: string }) => void
  removeCustomer: (id: string) => void
  saveProduct: (data: Partial<Product> & { company_id: string }) => void
  removeProduct: (id: string) => void
  saveGroup: (data: Partial<ProductGroup> & { company_id: string }) => void
  removeGroup: (id: string) => void
  saveUnit: (data: Partial<Unit> & { company_id: string }) => void
  removeUnit: (id: string) => void
  savePaymentForm: (data: Partial<PaymentForm> & { company_id: string }) => void
  removePaymentForm: (id: string) => void
  saveOrder: (data: Partial<Order> & { company_id: string }) => void
  removeOrder: (id: string) => void
  saveUser: (data: Partial<UserInCompany>) => void
  removeUser: (id: string) => void
  setParam: (chave: string, valor: string) => void
  adjustStock: (productId: string, delta: number) => void
}

export const useDataStore = create<DataStore>((set, get) => ({
  customers: [],
  products: SEED_PRODUCTS,
  groups: [],
  units: [],
  paymentForms: [],
  orders: SEED_ORDERS,
  users: [],
  parametros: [],

  hydrate: () => {
    void (async () => {
      try {
        const [products, groups, units, paymentForms, parametros, customers, users, orders] = await Promise.all([
          listProducts(), listGroups(), listUnits(), listPaymentForms(), listParametros(), listCustomers(), listUsuarios(), listOrders(),
        ])
        set({ products, groups, units, paymentForms, parametros, customers, users, orders })
      } catch (e) {
        console.error('Falha ao carregar dados do banco', e)
      }
    })()
  },

  productsFor: (companyId) => {
    const shareAll = get().getParam('COMPARTILHA_PRODUTO_FILIAIS') === 'S'
    return get().products.filter(
      (p) => p.company_id === companyId || (shareAll && p.company_id === SHARED),
    )
  },
  getParam: (chave) => get().parametros.find((p) => p.chave === chave)?.valor,

  saveCustomer: (data) => {
    void (async () => {
      try {
        if (data.id && get().customers.some((c) => c.id === data.id)) await updateCustomer(data.id, data)
        else await createCustomer(data)
        get().hydrate()
      } catch (e) { console.error('Falha ao salvar cliente', e) }
    })()
  },
  removeCustomer: (id) => {
    set((s) => ({ customers: s.customers.filter((x) => x.id !== id) }))
    void (async () => { try { await deleteCustomer(id) } catch (e) { console.error(e); get().hydrate() } })()
  },
  saveProduct: (data) => {
    void (async () => {
      try {
        if (data.id && get().products.some((p) => p.id === data.id)) {
          await updateProduct(data.id, data)
        } else {
          await createProduct(data)
        }
        get().hydrate()
      } catch (e) {
        console.error('Falha ao salvar produto', e)
      }
    })()
  },
  removeProduct: (id) => {
    set((s) => ({ products: s.products.filter((x) => x.id !== id) })) // otimista
    void (async () => {
      try {
        await deleteProduct(id)
      } catch (e) {
        console.error('Falha ao excluir produto', e)
        get().hydrate()
      }
    })()
  },
  saveGroup: (data) => {
    void (async () => {
      try {
        if (data.id && get().groups.some((g) => g.id === data.id)) await updateGroup(data.id, data)
        else await createGroup(data)
        get().hydrate()
      } catch (e) { console.error('Falha ao salvar grupo', e) }
    })()
  },
  removeGroup: (id) => {
    set((s) => ({ groups: s.groups.filter((x) => x.id !== id) }))
    void (async () => { try { await deleteGroup(id) } catch (e) { console.error(e); get().hydrate() } })()
  },
  saveUnit: (data) => {
    void (async () => {
      try {
        if (data.id && get().units.some((u) => u.id === data.id)) await updateUnit(data.id, data)
        else await createUnit(data)
        get().hydrate()
      } catch (e) { console.error('Falha ao salvar unidade', e) }
    })()
  },
  removeUnit: (id) => {
    set((s) => ({ units: s.units.filter((x) => x.id !== id) }))
    void (async () => { try { await deleteUnit(id) } catch (e) { console.error(e); get().hydrate() } })()
  },
  savePaymentForm: (data) => {
    void (async () => {
      try {
        if (data.id && get().paymentForms.some((f) => f.id === data.id)) await updatePaymentForm(data.id, data)
        else await createPaymentForm(data)
        get().hydrate()
      } catch (e) { console.error('Falha ao salvar forma de pagamento', e) }
    })()
  },
  removePaymentForm: (id) => {
    set((s) => ({ paymentForms: s.paymentForms.filter((x) => x.id !== id) }))
    void (async () => { try { await deletePaymentForm(id) } catch (e) { console.error(e); get().hydrate() } })()
  },
  saveOrder: (data) => {
    void (async () => {
      try {
        if (data.id && get().orders.some((o) => o.id === data.id)) await updateOrder(data.id, data)
        else await createOrder(data)
        get().hydrate()
      } catch (e) { console.error('Falha ao salvar pedido', e) }
    })()
  },
  removeOrder: (id) => {
    set((s) => ({ orders: s.orders.filter((x) => x.id !== id) }))
    void (async () => { try { await deleteOrder(id) } catch (e) { console.error(e); get().hydrate() } })()
  },
  saveUser: (data) => {
    void (async () => {
      try {
        if (data.id && get().users.some((u) => u.id === data.id)) await updateUsuario(data.id, data)
        else await createUsuario(data)
        get().hydrate()
      } catch (e) { console.error('Falha ao salvar usuário', e) }
    })()
  },
  removeUser: (id) => {
    set((s) => ({ users: s.users.filter((x) => x.id !== id) }))
    void (async () => { try { await deleteUsuario(id) } catch (e) { console.error(e); get().hydrate() } })()
  },
  setParam: (chave, valor) => {
    set((s) => ({ parametros: s.parametros.map((p) => (p.chave === chave ? { ...p, valor } : p)) }))
    void (async () => { try { await updateParametro(chave, valor) } catch (e) { console.error(e); get().hydrate() } })()
  },
  adjustStock: (productId, delta) => {
    const p = get().products.find((x) => x.id === productId)
    if (!p) return
    const stock = Math.max(0, p.stock + delta)
    set((s) => ({ products: s.products.map((x) => (x.id === productId ? { ...x, stock } : x)) })) // otimista
    void (async () => {
      try {
        await updateProduct(productId, { ...p, stock })
      } catch (e) {
        console.error('Falha ao ajustar estoque', e)
        get().hydrate()
      }
    })()
  },
}))

/**
 * Hook REATIVO dos produtos visíveis para a empresa (aplica o compartilhamento
 * entre filiais). Assina o array `products` — por isso a UI re-renderiza quando
 * o estoque/produtos mudam (ex.: ajuste de estoque). Prefira este hook a
 * chamar `productsFor` direto num componente.
 */
export function useScopedProducts(companyId: string | undefined): Product[] {
  const products = useDataStore((s) => s.products)
  const shareAll = useDataStore((s) => s.getParam('COMPARTILHA_PRODUTO_FILIAIS') === 'S')
  return products.filter((p) => p.company_id === companyId || (shareAll && p.company_id === SHARED))
}
