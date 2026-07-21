import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import Sidebar from '../sidebar/Sidebar'
import Header from '../header/Header'
import Toast from '../common/Toast'

export default function MainLayout() {
  const user = useAuthStore((state) => state.user)

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <Toast />
    </div>
  )
}
