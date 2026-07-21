import { useState } from 'react'
import { useAppStore } from '../../stores/appStore'
import { showToast } from '../common/Toast'
import { maskCpfCnpj, maskPhone, maskCep, isValidCpfCnpj, isValidPhone } from '../../lib/format'
import { Customer } from '../../types'

interface Props {
  initial?: Partial<Customer>
  onSubmit: (customer: Customer) => void
  onCancel: () => void
  submitLabel?: string
}

type FormState = {
  name: string; document: string; phone: string; email: string
  cep: string; address: string; number: string; complement: string
  neighborhood: string; city: string; state: string
  tipo_pessoa: 'F' | 'J'
  fantasia: string
  inscricao_estadual: string
  indicador_ie: 'contribuinte' | 'isento' | 'nao_contribuinte'
  inscricao_municipal: string
  codigo_municipio: string
  pais: string
}

const empty: FormState = {
  name: '', document: '', phone: '', email: '', cep: '', address: '',
  number: '', complement: '', neighborhood: '', city: '', state: '',
  tipo_pessoa: 'F', fantasia: '', inscricao_estadual: '', indicador_ie: 'nao_contribuinte',
  inscricao_municipal: '', codigo_municipio: '', pais: 'Brasil',
}

function genId() {
  return 'c' + Math.random().toString(36).slice(2, 9)
}

export default function CustomerForm({ initial, onSubmit, onCancel, submitLabel = 'Salvar' }: Props) {
  const company = useAppStore((s) => s.currentCompany)
  const [form, setForm] = useState<FormState>({
    ...empty,
    ...Object.fromEntries(Object.entries(initial ?? {}).filter(([, v]) => v != null)),
    name: initial?.name ?? '',
  } as FormState)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) { showToast('Selecione uma empresa', 'error'); return }
    if (!form.name.trim()) { showToast('Informe o nome', 'error'); return }
    if (form.document && !isValidCpfCnpj(form.document)) { showToast('CPF/CNPJ inválido', 'error'); return }
    if (form.phone && !isValidPhone(form.phone)) { showToast('Telefone inválido', 'error'); return }
    onSubmit({
      id: initial?.id ?? genId(),
      total_purchases: initial?.total_purchases ?? 0,
      company_id: company.id,
      ...form,
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Identificação */}
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
        <label className="text-sm sm:col-span-4">Nome / Razão social
          <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
        </label>
        <label className="text-sm sm:col-span-2">Documento (CPF/CNPJ)
          <input className="input mono" placeholder="000.000.000-00" value={form.document} onChange={(e) => set('document', maskCpfCnpj(e.target.value))} />
        </label>
        <label className="text-sm sm:col-span-3">Telefone
          <input className="input" placeholder="(11) 98888-1111" value={form.phone} onChange={(e) => set('phone', maskPhone(e.target.value))} />
        </label>
        <label className="text-sm sm:col-span-3">E-mail
          <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </label>
      </div>

      {/* Endereço */}
      <div>
        <p className="text-xs font-700 text-text-secondary uppercase tracking-wide mb-2">Endereço</p>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <label className="text-sm sm:col-span-2">CEP
            <input className="input mono" placeholder="00000-000" value={form.cep} onChange={(e) => set('cep', maskCep(e.target.value))} />
          </label>
          <label className="text-sm sm:col-span-3">Logradouro
            <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </label>
          <label className="text-sm sm:col-span-1">Número
            <input className="input" value={form.number} onChange={(e) => set('number', e.target.value)} />
          </label>
          <label className="text-sm sm:col-span-2">Complemento
            <input className="input" value={form.complement} onChange={(e) => set('complement', e.target.value)} />
          </label>
          <label className="text-sm sm:col-span-2">Bairro
            <input className="input" value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} />
          </label>
          <label className="text-sm sm:col-span-1">Cidade
            <input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} />
          </label>
          <label className="text-sm sm:col-span-1">UF
            <input className="input" maxLength={2} value={form.state} onChange={(e) => set('state', e.target.value.toUpperCase())} />
          </label>
        </div>
      </div>

      {/* Dados fiscais (NF-e / NFC-e) — opcionais */}
      <div>
        <p className="text-xs font-700 text-text-secondary uppercase tracking-wide mb-2">Dados fiscais (NF-e / NFC-e) — opcionais</p>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
          <label className="text-sm sm:col-span-2">Tipo de pessoa
            <select className="input" value={form.tipo_pessoa} onChange={(e) => set('tipo_pessoa', e.target.value as 'F' | 'J')}>
              <option value="F">Física</option>
              <option value="J">Jurídica</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-4">Nome fantasia
            <input className="input" value={form.fantasia} onChange={(e) => set('fantasia', e.target.value)} />
          </label>
          <label className="text-sm sm:col-span-3">Indicador de IE
            <select className="input" value={form.indicador_ie} onChange={(e) => set('indicador_ie', e.target.value as FormState['indicador_ie'])}>
              <option value="nao_contribuinte">Não contribuinte</option>
              <option value="contribuinte">Contribuinte ICMS</option>
              <option value="isento">Contribuinte isento de IE</option>
            </select>
          </label>
          <label className="text-sm sm:col-span-3">Inscrição Estadual (IE)
            <input className="input mono" value={form.inscricao_estadual} onChange={(e) => set('inscricao_estadual', e.target.value)} />
          </label>
          <label className="text-sm sm:col-span-2">Inscrição Municipal
            <input className="input mono" value={form.inscricao_municipal} onChange={(e) => set('inscricao_municipal', e.target.value)} />
          </label>
          <label className="text-sm sm:col-span-2">Cód. município (IBGE)
            <input className="input mono" value={form.codigo_municipio} onChange={(e) => set('codigo_municipio', e.target.value)} />
          </label>
          <label className="text-sm sm:col-span-2">País
            <input className="input" value={form.pais} onChange={(e) => set('pais', e.target.value)} />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="px-4 h-10 rounded-md border border-border text-text-secondary font-600">Cancelar</button>
        <button type="submit" className="px-5 h-10 rounded-md bg-primary text-white font-600">{submitLabel}</button>
      </div>
    </form>
  )
}
