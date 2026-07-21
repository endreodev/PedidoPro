import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useAppStore } from '../../stores/appStore'

export default function CompanySelector() {
  const user = useAuthStore((state) => state.user)
  const currentCompany = useAppStore((state) => state.currentCompany)
  const setCurrentCompany = useAppStore((state) => state.setCurrentCompany)
  const [open, setOpen] = useState(false)

  const companies = user?.companies || []
  const active = currentCompany || companies[0]

  const handleSelectCompany = (companyId: string) => {
    const selected = companies.find((c) => c.id === companyId)
    if (selected) {
      setCurrentCompany(selected)
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-sidebar-elevation border border-sidebar rounded-md px-3 py-2 flex items-center gap-2 text-left hover:bg-opacity-80 transition-colors"
      >
        <div
          className="w-[30px] h-[30px] rounded-md flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: active?.color }}
        >
          {active?.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-600 text-text-secondary uppercase">Empresa</p>
          <p className="text-sm font-700 text-white truncate">{active?.name}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-text-secondary" />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface rounded-lg shadow-dropdown z-40 overflow-hidden">
          <div className="p-3 border-b border-border">
            <p className="text-xs font-700 text-text-primary uppercase">Minhas Empresas</p>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleSelectCompany(company.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-background transition-colors ${
                  active?.id === company.id ? 'bg-primary/5' : ''
                }`}
              >
                <div
                  className="w-[34px] h-[34px] rounded-md flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: company.color }}
                >
                  {company.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-600 text-text-primary">{company.name}</p>
                  <p className="text-xs text-text-secondary">{company.branch} · {company.cnpj}</p>
                </div>
                {active?.id === company.id && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <button className="w-full px-4 py-3 flex items-center gap-2 text-primary font-600 hover:bg-background transition-colors border-t border-border">
            <Plus className="w-4 h-4" />
            <span className="text-sm">Adicionar empresa</span>
          </button>
        </div>
      )}
    </div>
  )
}
