import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { showToast } from './Toast'

/**
 * Botão "Atualizar" para telas de cadastro. Hoje re-renderiza a lista a partir
 * do store local; quando houver backend, ligar `onRefresh` ao refetch da API.
 */
export default function RefreshButton({ onRefresh }: { onRefresh?: () => void }) {
  const [spinning, setSpinning] = useState(false)

  const handleClick = () => {
    setSpinning(true)
    onRefresh?.()
    showToast('Lista atualizada', 'info')
    window.setTimeout(() => setSpinning(false), 500)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Atualizar"
      className="flex items-center gap-2 h-10 px-4 rounded-md border border-border text-text-secondary hover:bg-background font-600"
    >
      <RefreshCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
      Atualizar
    </button>
  )
}
