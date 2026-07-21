import { Bell, Search, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAppStore } from '../../stores/appStore'
import PaletteMenu from '../common/PaletteMenu'

const PATH_LABELS: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral do seu negócio' },
  '/pdv': { title: 'PDV', subtitle: 'Ponto de venda' },
  '/orders': { title: 'Pedidos', subtitle: 'Gerenciar pedidos' },
  '/customers': { title: 'Clientes', subtitle: 'Gerenciar clientes' },
  '/products': { title: 'Produtos', subtitle: 'Catálogo de produtos' },
  '/product-groups': { title: 'Grupos de Produtos', subtitle: 'Organizar produtos' },
  '/units': { title: 'Unidades', subtitle: 'Unidades de medida' },
  '/payment-methods': { title: 'Formas de Pagamento', subtitle: 'Configurar pagamentos' },
  '/stock-control': { title: 'Controle de Estoque', subtitle: 'Gerenciar estoque' },
  '/caixas': { title: 'Conferência de Caixas', subtitle: 'Caixas abertos e fechados por data' },
  '/financeiro': { title: 'Financeiro', subtitle: 'Controle financeiro' },
  '/financeiro/contas': { title: 'Contas', subtitle: 'Categorias financeiras (receitas e despesas)' },
  '/financeiro/bancos': { title: 'Contas Bancárias', subtitle: 'Bancos e caixa' },
  '/financeiro/titulos': { title: 'Títulos', subtitle: 'Contas a receber e a pagar' },
  '/users': { title: 'Usuários', subtitle: 'Gerenciar usuários' },
  '/settings': { title: 'Configurações', subtitle: 'Parâmetros e aparência' },
}

export default function Header() {
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const { pathname } = useLocation()

  const base = '/' + (pathname.split('/')[1] ?? '')
  const view = PATH_LABELS[pathname] || PATH_LABELS[base] || { title: 'PedidosPro', subtitle: 'Gestão de vendas' }

  return (
    <header className="h-[62px] bg-surface border-b border-border flex items-center justify-between px-6 gap-4">
      {/* Left: Title and Subtitle */}
      <div className="flex-1">
        <h1 className="text-4xl font-800 text-text-primary">{view.title}</h1>
        <p className="text-sm text-text-secondary">{view.subtitle}</p>
      </div>

      {/* Right: Search and Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Buscar..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 h-[38px] bg-background rounded-sm border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {/* Palette switcher */}
        <PaletteMenu />

        {/* Notifications */}
        <button className="w-[38px] h-[38px] bg-background rounded-sm hover:bg-border transition-colors flex items-center justify-center">
          <Bell className="w-5 h-5 text-text-secondary" />
        </button>

        {/* Menu (mobile) */}
        <button
          onClick={toggleSidebar}
          className="hidden sm:flex w-[38px] h-[38px] bg-background rounded-sm hover:bg-border transition-colors items-center justify-center"
        >
          <Menu className="w-5 h-5 text-text-secondary" />
        </button>
      </div>
    </header>
  )
}
