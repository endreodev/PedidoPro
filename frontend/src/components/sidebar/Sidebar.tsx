import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  ShoppingCart,
  FileText,
  Users,
  Package,
  Layers,
  Ruler,
  CreditCard,
  Archive,
  Wallet,
  Coins,
  Landmark,
  Receipt,
  Puzzle,
  ChevronDown,
  LogOut,
  Settings,
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'
import { canAccess } from '../../lib/permissions'
import CompanySelector from './CompanySelector'

const PERFIL_LABEL: Record<string, string> = {
  administrador: 'Administrador',
  vendedor: 'Vendedor',
  caixa: 'Caixa',
}

export default function Sidebar() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const handleLogout = useAuthStore((state) => state.handleLogout)
  const currentView = useAppStore((state) => state.currentView)
  const setCurrentView = useAppStore((state) => state.setCurrentView)

  const handleNavigation = (view: string, path: string) => {
    setCurrentView(view)
    navigate(path)
  }

  const isActive = (view: string) => currentView === view

  // Grupos recolhidos (persistido no dispositivo).
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('nav_collapsed') || '{}') } catch { return {} }
  })
  const toggleGroup = (label: string) => {
    setCollapsed((c) => {
      const next = { ...c, [label]: !c[label] }
      try { localStorage.setItem('nav_collapsed', JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  const navGroups = [
    {
      label: 'PRINCIPAL',
      items: [
        { icon: LayoutGrid, label: 'Dashboard', view: 'dashboard', path: '/' },
        { icon: ShoppingCart, label: 'PDV', view: 'pdv', path: '/pdv' },
        { icon: FileText, label: 'Pedidos', view: 'orders', path: '/orders' },
      ],
    },
    {
      label: 'CADASTROS',
      items: [
        { icon: Users, label: 'Clientes', view: 'customers', path: '/customers' },
        { icon: Package, label: 'Produtos', view: 'products', path: '/products' },
        { icon: Layers, label: 'Grupos de Produtos', view: 'product-groups', path: '/product-groups' },
        { icon: Ruler, label: 'Unidades', view: 'units', path: '/units' },
        { icon: CreditCard, label: 'Formas de Pagamento', view: 'payment-methods', path: '/payment-methods' },
      ],
    },
    {
      label: 'OPERAÇÃO',
      items: [
        { icon: Archive, label: 'Controle de Estoque', view: 'stock-control', path: '/stock-control' },
      ],
    },
    {
      label: 'FINANCEIRO',
      items: [
        { icon: Coins, label: 'Contas', view: 'fin-contas', path: '/financeiro/contas' },
        { icon: Landmark, label: 'Contas Bancárias', view: 'fin-bancos', path: '/financeiro/bancos' },
        { icon: Receipt, label: 'Títulos', view: 'fin-titulos', path: '/financeiro/titulos' },
      ],
    },
    {
      label: 'ADMIN',
      items: [
        { icon: Wallet, label: 'Conferência de Caixas', view: 'caixas', path: '/caixas' },
        { icon: Puzzle, label: 'Integrações', view: 'integracoes', path: '/integracoes' },
        { icon: Users, label: 'Usuários', view: 'users', path: '/users' },
      ],
    },
  ]

  // Aplica o controle de acesso por perfil: some com itens/grupos sem permissão.
  const perfil = user?.role
  const visibleGroups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => canAccess(perfil, i.view)) }))
    .filter((g) => g.items.length > 0)

  return (
    <aside className="w-[236px] bg-sidebar text-white flex flex-col h-screen overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-elevation">
        <div className="flex items-center gap-3">
          <div className="w-[34px] h-[34px] rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
            P
          </div>
          <div>
            <h1 className="font-800 text-lg leading-none">PedidoPro</h1>
            <p className="text-xs text-text-secondary">Gestão de vendas</p>
          </div>
        </div>
      </div>

      {/* Company Selector */}
      <div className="px-4 py-4 border-b border-sidebar-elevation">
        <CompanySelector />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        {visibleGroups.map((group) => {
          const isCollapsed = !!collapsed[group.label]
          return (
            <div key={group.label}>
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-600 text-text-secondary uppercase tracking-wider hover:text-white transition-colors"
                aria-expanded={!isCollapsed}
              >
                <span>{group.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
              </button>
              {!isCollapsed && (
                <div className="space-y-1 px-2 pb-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const active = isActive(item.view)
                    return (
                      <button
                        key={item.view}
                        onClick={() => handleNavigation(item.view, item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-600 transition-colors ${
                          active
                            ? 'bg-white/10 text-white'
                            : 'text-text-secondary hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-[17px] h-[17px]" />
                        <span className="text-[13.5px]">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Card and Logout */}
      <div className="p-4 border-t border-sidebar-elevation space-y-3">
        {/* Settings (Parâmetros) — somente quem tem acesso */}
        {canAccess(perfil, 'settings') && (
          <button
            onClick={() => handleNavigation('settings', '/settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-600 transition-colors ${
              isActive('settings')
                ? 'bg-white/10 text-white'
                : 'text-text-secondary hover:bg-white/5'
            }`}
          >
            <Settings className="w-[17px] h-[17px]" />
            <span className="text-[13.5px]">Configurações</span>
          </button>
        )}

        {/* User Card */}
        <div className="bg-sidebar-elevation rounded-md p-3">
          <div className="flex items-center gap-2">
            <div className="w-[30px] h-[30px] rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-700 text-white truncate">{user?.name}</p>
              <p className="text-xs text-text-secondary truncate">{PERFIL_LABEL[user?.role ?? ''] ?? user?.role}</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-600 text-text-secondary hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-[17px] h-[17px]" />
          <span className="text-[13.5px]">Sair</span>
        </button>
      </div>
    </aside>
  )
}
