// Auth Types
export type Perfil = 'administrador' | 'vendedor' | 'caixa'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: Perfil
  permissions: Permission[]
  companies: Company[]
  currentCompanyId: string
}

export interface Parametro {
  chave: string
  valor: string
  tipo: 'TEXTO' | 'NUMERO' | 'BOOL' | 'JSON'
  descricao: string
  editavel: boolean
  company_id: string | null
}

export interface Permission {
  id: string
  name: string
  description: string
}

// Auth Request/Response
export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface AuthResponse {
  user: User
  token: string
}

// Company Types
export interface Company {
  id: string
  name: string
  cnpj: string
  branch: 'varejo' | 'alimentacao' | 'atacado' | 'servicos' | 'outro'
  color: string
  logo?: string
  subscription?: Subscription
}

// Subscription & Billing
export interface Plan {
  id: string
  name: string
  slug: string
  description: string
  price: number
  cycle: 'monthly' | 'yearly'
  features: Feature[]
  limits: PlanLimits
  status: 'active' | 'inactive'
}

export interface Feature {
  id: string
  name: string
  description: string
}

export interface PlanLimits {
  users: number
  companies: number
  products: number
  orders: number
  storage: number
}

export interface Subscription {
  id: string
  plan_id: string
  plan: Plan
  company_id: string
  status: 'active' | 'canceled' | 'expired' | 'pending'
  started_at: string
  ends_at: string
  payment_method_id?: string
}

export interface Invoice {
  id: string
  subscription_id: string
  company_id: string
  status: 'pending' | 'paid' | 'failed'
  amount: number
  due_date: string
  issued_date: string
  payment_date?: string
}

export interface PaymentMethod {
  id: string
  user_id: string
  type: 'card' | 'pix' | 'bank_transfer'
  last_4_digits?: string
  is_default: boolean
}

// User Management
export interface UserInCompany {
  id: string
  name: string
  email: string
  role: Perfil
  status: 'active' | 'inactive'
  joined_at: string
  last_login?: string
}

// Activity Log
export interface ActivityLog {
  id: string
  user_id: string
  company_id: string
  entity_type: string
  entity_id: string
  action: 'create' | 'update' | 'delete' | 'view'
  changes?: Record<string, unknown>
  created_at: string
}

// Main Business Entities
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  document: string
  cep?: string
  address?: string
  number?: string
  complement?: string
  neighborhood?: string
  city: string
  state?: string
  // Dados fiscais (NF-e / NFC-e) — todos opcionais
  tipo_pessoa?: 'F' | 'J'
  fantasia?: string
  inscricao_estadual?: string
  indicador_ie?: 'contribuinte' | 'isento' | 'nao_contribuinte'
  inscricao_municipal?: string
  codigo_municipio?: string
  pais?: string
  total_purchases: number
  company_id: string
}

export interface PriceTier {
  qty_min: number
  unit_price: number
  label?: string
}

export interface Product {
  id: string
  name: string
  sku: string
  group_id: string
  unit_id: string
  price: number
  custo_medio: number
  stock: number
  min_stock: number
  price_tiers?: PriceTier[]
  flavors?: string[]
  company_id: string
}

export interface ProductGroup {
  id: string
  name: string
  color: string
  company_id: string
  product_count: number
}

export interface Unit {
  id: string
  slug: string
  description: string
  company_id: string
}

export interface PaymentForm {
  id: string
  name: string
  type: 'cash' | 'pix' | 'card' | 'transfer' | 'boleto'
  fee_percentage: number
  payment_deadline: number
  is_active: boolean
  company_id: string
}

export interface Order {
  id: string
  number: string
  customer_id: string
  status: 'draft' | 'orcamento' | 'open' | 'separating' | 'completed' | 'canceled'
  items: OrderItem[]
  payments?: OrderPayment[]
  subtotal: number
  discount: number
  total: number
  created_at: string
  company_id: string
}

export interface OrderItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  flavor?: string
}

export interface OrderPayment {
  id: string
  payment_form_id: string
  amount: number
}

// Analytics
export interface Analytics {
  total_revenue: number
  total_orders: number
  average_order_value: number
  customer_count: number
  product_count: number
  period: 'today' | 'week' | 'month' | 'year'
  revenue_trend: DataPoint[]
  orders_trend: DataPoint[]
  top_products: ProductAnalytic[]
  top_customers: CustomerAnalytic[]
}

export interface DataPoint {
  date: string
  value: number
}

export interface ProductAnalytic {
  id: string
  name: string
  quantity_sold: number
  revenue: number
}

export interface CustomerAnalytic {
  id: string
  name: string
  total_spent: number
  order_count: number
}
