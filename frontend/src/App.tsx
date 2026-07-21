import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { canAccess, landingPath } from './lib/permissions'
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import DashboardPage from './pages/DashboardPage'
import PDVPage from './pages/PDVPage'
import OrdersPage from './pages/OrdersPage'
import OrderEditorPage from './pages/OrderEditorPage'
import CustomersPage from './pages/CustomersPage'
import CustomerEditorPage from './pages/CustomerEditorPage'
import ProductsPage from './pages/ProductsPage'
import ProductEditorPage from './pages/ProductEditorPage'
import ProductGroupsPage from './pages/ProductGroupsPage'
import ProductGroupEditorPage from './pages/ProductGroupEditorPage'
import UnitsPage from './pages/UnitsPage'
import UnitEditorPage from './pages/UnitEditorPage'
import PaymentMethodsPage from './pages/PaymentMethodsPage'
import PaymentMethodEditorPage from './pages/PaymentMethodEditorPage'
import StockControlPage from './pages/StockControlPage'
import StockEditorPage from './pages/StockEditorPage'
import UsersPage from './pages/UsersPage'
import CaixaConferenciaPage from './pages/CaixaConferenciaPage'
import ContasFinanceirasPage from './pages/financeiro/ContasFinanceirasPage'
import ContaFinanceiraEditorPage from './pages/financeiro/ContaFinanceiraEditorPage'
import ContasBancariasPage from './pages/financeiro/ContasBancariasPage'
import ContaBancariaEditorPage from './pages/financeiro/ContaBancariaEditorPage'
import TitulosPage from './pages/financeiro/TitulosPage'
import TituloEditorPage from './pages/financeiro/TituloEditorPage'
import SettingsPage from './pages/SettingsPage'

/** Bloqueia rotas fora do alcance do perfil (caixa → só PDV). */
function Guarded({ view, children }: { view: string; children: ReactElement }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (!canAccess(user.role, view)) return <Navigate to={landingPath(user.role)} replace />
  return children
}

function App() {
  const user = useAuthStore((state) => state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const checkAuth = useAuthStore((state) => state.checkAuth)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {user ? (
          <>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Guarded view="dashboard"><DashboardPage /></Guarded>} />
              <Route path="/pdv" element={<Guarded view="pdv"><PDVPage /></Guarded>} />
              <Route path="/orders" element={<Guarded view="orders"><OrdersPage /></Guarded>} />
              <Route path="/orders/new" element={<Guarded view="orders"><OrderEditorPage /></Guarded>} />
              <Route path="/orders/:id" element={<Guarded view="orders"><OrderEditorPage /></Guarded>} />
              <Route path="/customers" element={<Guarded view="customers"><CustomersPage /></Guarded>} />
              <Route path="/customers/new" element={<Guarded view="customers"><CustomerEditorPage /></Guarded>} />
              <Route path="/customers/:id" element={<Guarded view="customers"><CustomerEditorPage /></Guarded>} />
              <Route path="/products" element={<Guarded view="products"><ProductsPage /></Guarded>} />
              <Route path="/products/new" element={<Guarded view="products"><ProductEditorPage /></Guarded>} />
              <Route path="/products/:id" element={<Guarded view="products"><ProductEditorPage /></Guarded>} />
              <Route path="/product-groups" element={<Guarded view="product-groups"><ProductGroupsPage /></Guarded>} />
              <Route path="/product-groups/new" element={<Guarded view="product-groups"><ProductGroupEditorPage /></Guarded>} />
              <Route path="/product-groups/:id" element={<Guarded view="product-groups"><ProductGroupEditorPage /></Guarded>} />
              <Route path="/units" element={<Guarded view="units"><UnitsPage /></Guarded>} />
              <Route path="/units/new" element={<Guarded view="units"><UnitEditorPage /></Guarded>} />
              <Route path="/units/:id" element={<Guarded view="units"><UnitEditorPage /></Guarded>} />
              <Route path="/payment-methods" element={<Guarded view="payment-methods"><PaymentMethodsPage /></Guarded>} />
              <Route path="/payment-methods/new" element={<Guarded view="payment-methods"><PaymentMethodEditorPage /></Guarded>} />
              <Route path="/payment-methods/:id" element={<Guarded view="payment-methods"><PaymentMethodEditorPage /></Guarded>} />
              <Route path="/stock-control" element={<Guarded view="stock-control"><StockControlPage /></Guarded>} />
              <Route path="/stock-control/:id" element={<Guarded view="stock-control"><StockEditorPage /></Guarded>} />
              <Route path="/caixas" element={<Guarded view="caixas"><CaixaConferenciaPage /></Guarded>} />
              <Route path="/financeiro/contas" element={<Guarded view="fin-contas"><ContasFinanceirasPage /></Guarded>} />
              <Route path="/financeiro/contas/new" element={<Guarded view="fin-contas"><ContaFinanceiraEditorPage /></Guarded>} />
              <Route path="/financeiro/contas/:id" element={<Guarded view="fin-contas"><ContaFinanceiraEditorPage /></Guarded>} />
              <Route path="/financeiro/bancos" element={<Guarded view="fin-bancos"><ContasBancariasPage /></Guarded>} />
              <Route path="/financeiro/bancos/new" element={<Guarded view="fin-bancos"><ContaBancariaEditorPage /></Guarded>} />
              <Route path="/financeiro/bancos/:id" element={<Guarded view="fin-bancos"><ContaBancariaEditorPage /></Guarded>} />
              <Route path="/financeiro/titulos" element={<Guarded view="fin-titulos"><TitulosPage /></Guarded>} />
              <Route path="/financeiro/titulos/new" element={<Guarded view="fin-titulos"><TituloEditorPage /></Guarded>} />
              <Route path="/financeiro/titulos/:id" element={<Guarded view="fin-titulos"><TituloEditorPage /></Guarded>} />
              <Route path="/users" element={<Guarded view="users"><UsersPage /></Guarded>} />
              <Route path="/settings" element={<Guarded view="settings"><SettingsPage /></Guarded>} />
            </Route>
            <Route path="*" element={<Navigate to={landingPath(user.role)} replace />} />
          </>
        ) : (
          <>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
    </Router>
  )
}

export default App
