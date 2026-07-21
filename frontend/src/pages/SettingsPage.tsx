import PalettePicker from '../components/common/PalettePicker'
import { useDataStore } from '../stores/dataStore'
import { showToast } from '../components/common/Toast'

export default function SettingsPage() {
  const parametros = useDataStore((s) => s.parametros)
  const setParam = useDataStore((s) => s.setParam)

  const toggleBool = (chave: string, atual: string) => {
    const novo = atual === 'S' ? 'N' : 'S'
    setParam(chave, novo)
    showToast('Parâmetro atualizado', 'success')
  }

  return (
    <div className="max-w-3xl space-y-6">
      <section className="bg-surface border border-border rounded-lg p-6 shadow-card">
        <h2 className="text-lg font-800 text-text-primary">Parâmetros</h2>
        <p className="text-sm text-text-secondary mb-5">Configurações gerais do sistema.</p>
        <div className="divide-y divide-border">
          {parametros.map((p) => (
            <div key={p.chave} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-600 text-text-primary">{p.descricao}</p>
                <p className="text-xs text-text-secondary mono">{p.chave}</p>
              </div>
              {p.tipo === 'BOOL' ? (
                <button
                  onClick={() => toggleBool(p.chave, p.valor)}
                  disabled={p.editavel === false}
                  className={`relative w-11 h-6 rounded-full transition-colors ${p.valor === 'S' ? 'bg-success' : 'bg-border'}`}
                  aria-pressed={p.valor === 'S'}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${p.valor === 'S' ? 'translate-x-5' : ''}`} />
                </button>
              ) : (
                <input
                  className="input max-w-[180px]"
                  value={p.valor}
                  onChange={(e) => setParam(p.chave, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface border border-border rounded-lg p-6 shadow-card">
        <h2 className="text-lg font-800 text-text-primary">Aparência</h2>
        <p className="text-sm text-text-secondary mb-5">
          Escolha a paleta de cores do sistema. A preferência fica salva neste dispositivo.
        </p>
        <PalettePicker />
      </section>
    </div>
  )
}
