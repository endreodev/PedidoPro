import { Perfil } from '../types'

// Views que cada perfil pode acessar. Espelha docs/PADRAO-USUARIOS-ACESSOS.md.
const MATRIX: Record<Perfil, string[]> = {
  administrador: [
    'dashboard', 'pdv', 'orders', 'customers', 'products',
    'product-groups', 'units', 'payment-methods', 'stock-control',
    'caixas', 'fin-contas', 'fin-bancos', 'fin-titulos', 'users', 'settings',
  ],
  vendedor: [
    'dashboard', 'pdv', 'orders', 'customers', 'products',
    'product-groups', 'units', 'payment-methods', 'stock-control',
  ],
  caixa: ['pdv'],
}

// Views que o perfil vê apenas em modo leitura (esconde ações de escrita).
const READONLY: Record<Perfil, string[]> = {
  administrador: [],
  vendedor: ['payment-methods'],
  caixa: [],
}

const VIEW_TO_PATH: Record<string, string> = {
  dashboard: '/',
  pdv: '/pdv',
  orders: '/orders',
  customers: '/customers',
  products: '/products',
  'product-groups': '/product-groups',
  units: '/units',
  'payment-methods': '/payment-methods',
  'stock-control': '/stock-control',
  caixas: '/caixas',
  'fin-contas': '/financeiro/contas',
  'fin-bancos': '/financeiro/bancos',
  'fin-titulos': '/financeiro/titulos',
  users: '/users',
  settings: '/settings',
}

export function canAccess(perfil: Perfil | undefined, view: string): boolean {
  if (!perfil) return false
  return MATRIX[perfil]?.includes(view) ?? false
}

export function isReadOnly(perfil: Perfil | undefined, view: string): boolean {
  if (!perfil) return true
  return READONLY[perfil]?.includes(view) ?? false
}

/** Primeira tela ao logar. Caixa cai direto no PDV. */
export function landingPath(perfil: Perfil | undefined): string {
  return perfil === 'caixa' ? '/pdv' : '/'
}

export function pathFor(view: string): string {
  return VIEW_TO_PATH[view] ?? '/'
}
