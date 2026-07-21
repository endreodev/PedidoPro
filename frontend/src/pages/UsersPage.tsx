import { useState } from 'react'
import { UserPlus, Pencil, Trash2, X } from 'lucide-react'
import { useDataStore } from '../stores/dataStore'
import { useAppStore } from '../stores/appStore'
import { showToast } from '../components/common/Toast'
import RefreshButton from '../components/common/RefreshButton'
import FilterInput from '../components/common/FilterInput'
import { UserInCompany, Perfil } from '../types'

const PERFIL: Record<Perfil, { label: string; color: string }> = {
  administrador: { label: 'Administrador', color: '#5865f2' },
  vendedor: { label: 'Vendedor', color: '#3a7bd5' },
  caixa: { label: 'Caixa', color: '#c47f16' },
}
const tint = (hex: string) => ({ backgroundColor: `${hex}22`, color: hex })

const empty = { name: '', email: '', role: 'vendedor' as Perfil, status: 'active' as 'active' | 'inactive' }

export default function UsersPage() {
  const search = useAppStore((s) => s.searchQuery).toLowerCase()
  const users = useDataStore((s) => s.users)
  const saveUser = useDataStore((s) => s.saveUser)
  const removeUser = useDataStore((s) => s.removeUser)

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(empty)
  const [filter, setFilter] = useState('')

  const q = filter.toLowerCase()
  const list = users.filter((u) => {
    const t = `${u.name} ${u.email}`.toLowerCase()
    return t.includes(search) && t.includes(q)
  })

  const startNew = () => { setEditId(null); setForm(empty); setOpen(true) }
  const startEdit = (u: UserInCompany) => { setEditId(u.id); setForm({ name: u.name, email: u.email, role: u.role, status: u.status }); setOpen(true) }
  const submit = () => {
    saveUser({ ...(editId ? { id: editId } : { joined_at: '2026-07-14' }), ...form })
    setOpen(false)
    showToast(editId ? 'Usuário atualizado' : 'Usuário criado', 'success')
  }
  const del = (u: UserInCompany) => { removeUser(u.id); showToast('Usuário excluído', 'success') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <FilterInput value={filter} onChange={setFilter} placeholder="Filtrar usuários..." />
        <div className="flex gap-2">
          <RefreshButton />
          <button onClick={startNew} className="flex items-center gap-2 bg-primary text-white rounded-md px-4 h-10 font-600 hover:opacity-90">
            <UserPlus className="w-4 h-4" /> Novo usuário
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-lg shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-border">
              <th className="p-3 font-600">Usuário</th>
              <th className="p-3 font-600">Perfil</th>
              <th className="p-3 font-600">Status</th>
              <th className="p-3 font-600">Entrou</th>
              <th className="p-3 font-600">Último acesso</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 text-text-primary">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-700" style={{ background: PERFIL[u.role].color }}>{u.name.charAt(0)}</div>
                    <div><p className="font-600">{u.name}</p><p className="text-xs text-text-secondary">{u.email}</p></div>
                  </div>
                </td>
                <td className="p-3"><span className="px-2 py-1 rounded text-xs font-600" style={tint(PERFIL[u.role].color)}>{PERFIL[u.role].label}</span></td>
                <td className="p-3">
                  {u.status === 'active'
                    ? <span className="px-2 py-1 rounded text-xs font-600" style={tint('#1f9d6b')}>Ativo</span>
                    : <span className="px-2 py-1 rounded text-xs font-600" style={tint('#8b93a2')}>Inativo</span>}
                </td>
                <td className="p-3 mono text-text-secondary">{u.joined_at}</td>
                <td className="p-3 mono text-text-secondary">{u.last_login ?? '—'}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => startEdit(u)} className="p-2 rounded hover:bg-background text-text-secondary"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => del(u)} className="p-2 rounded hover:bg-background text-error"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-text-secondary">Nenhum usuário</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-surface rounded-xl shadow-modal p-6 w-full max-w-md animate-popIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-800 text-text-primary">{editId ? 'Editar usuário' : 'Novo usuário'}</h3>
              <button onClick={() => setOpen(false)} className="text-text-secondary"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <label className="block text-sm">Nome<input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label className="block text-sm">E-mail<input className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
              <label className="block text-sm">Perfil
                <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Perfil })}>
                  <option value="administrador">Administrador</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="caixa">Caixa</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-text-primary">
                <input type="checkbox" checked={form.status === 'active'} onChange={(e) => setForm({ ...form, status: e.target.checked ? 'active' : 'inactive' })} />
                Usuário ativo
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setOpen(false)} className="px-4 h-10 rounded-md border border-border text-text-secondary">Cancelar</button>
              <button onClick={submit} className="px-4 h-10 rounded-md bg-primary text-white font-600">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
