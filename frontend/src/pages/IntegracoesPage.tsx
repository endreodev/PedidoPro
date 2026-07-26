import { useEffect, useState } from 'react'
import { Plus, Trash2, Copy, KeyRound, Puzzle } from 'lucide-react'
import { showToast } from '../components/common/Toast'
import { listTokens, gerarToken, revogarToken, IntegToken } from '../api/integracao'

export default function IntegracoesPage() {
  const [tokens, setTokens] = useState<IntegToken[]>([])
  const [descricao, setDescricao] = useState('Extensão Chrome')
  const [novo, setNovo] = useState<string | null>(null)

  const load = () => { listTokens().then(setTokens).catch(() => {}) }
  useEffect(load, [])

  const gerar = async () => {
    try {
      const r = await gerarToken(descricao.trim() || 'Extensão Chrome')
      setNovo(r.token)
      showToast('Token gerado', 'success')
      load()
    } catch { showToast('Falha ao gerar token', 'error') }
  }
  const revogar = async (id: string) => {
    try { await revogarToken(id); showToast('Token revogado', 'success'); load() } catch { showToast('Falha ao revogar', 'error') }
  }
  const copiar = (v: string) => { navigator.clipboard?.writeText(v); showToast('Copiado', 'info') }

  return (
    <div className="max-w-3xl space-y-6">
      <section className="bg-surface border border-border rounded-lg shadow-card p-6">
        <div className="flex items-center gap-2 mb-1 text-text-primary"><KeyRound className="w-5 h-5" /><h2 className="text-lg font-800">Tokens de integração</h2></div>
        <p className="text-sm text-text-secondary mb-4">Gere um token para a extensão do Chrome enviar contatos como clientes. O token é exibido <b>uma única vez</b>.</p>
        <div className="flex items-end gap-2">
          <label className="flex-1 text-sm">Descrição
            <input className="input" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: Extensão WhatsApp" />
          </label>
          <button onClick={gerar} className="flex items-center gap-2 bg-primary text-white rounded-md px-4 h-10 font-600"><Plus className="w-4 h-4" /> Gerar token</button>
        </div>

        {novo && (
          <div className="mt-4 p-3 rounded-md border border-success/40 bg-success/10">
            <p className="text-xs font-700 text-text-secondary uppercase mb-1">Token gerado — copie agora</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 mono text-sm break-all text-text-primary">{novo}</code>
              <button onClick={() => copiar(novo)} className="flex items-center gap-1 text-sm text-primary font-600"><Copy className="w-4 h-4" /> Copiar</button>
            </div>
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary border-b border-border">
                <th className="py-2 font-600">Descrição</th>
                <th className="py-2 font-600">Token</th>
                <th className="py-2 font-600">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 text-text-primary">
                  <td className="py-2">{t.descricao}</td>
                  <td className="py-2 mono text-text-secondary">{t.token_mascarado}</td>
                  <td className="py-2">{t.ativo ? <span className="text-success font-600">Ativo</span> : <span className="text-text-secondary">Revogado</span>}</td>
                  <td className="py-2 text-right">{t.ativo && <button onClick={() => revogar(t.id)} className="p-2 rounded hover:bg-background text-error"><Trash2 className="w-4 h-4" /></button>}</td>
                </tr>
              ))}
              {tokens.length === 0 && <tr><td colSpan={4} className="py-4 text-text-secondary">Nenhum token gerado.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-surface border border-border rounded-lg shadow-card p-6">
        <div className="flex items-center gap-2 mb-2 text-text-primary"><Puzzle className="w-5 h-5" /><h2 className="text-lg font-800">Extensão do Chrome</h2></div>
        <ol className="text-sm text-text-secondary space-y-1 list-decimal pl-5">
          <li>Em <code className="mono">chrome://extensions</code>, ative o <b>Modo do desenvolvedor</b> e clique em <b>Carregar sem compactação</b> apontando para a pasta <code className="mono">chrome-extension/</code>.</li>
          <li>No popup da extensão, informe a <b>URL</b> do sistema e cole o <b>token</b> gerado acima.</li>
          <li>Abra o <b>web.whatsapp.com</b> e clique em <b>Sincronizar contatos</b>. Repetidos (mesmo telefone) não são duplicados.</li>
        </ol>
      </section>
    </div>
  )
}
