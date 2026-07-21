// Máscaras e validações de documento/telefone (pt-BR).

const digits = (v: string) => v.replace(/\D/g, '')

/** Máscara progressiva CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00). */
export function maskCpfCnpj(value: string): string {
  const d = digits(value).slice(0, 14)
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

/** Máscara telefone (00) 0000-0000 ou (00) 00000-0000. */
export function maskPhone(value: string): string {
  const d = digits(value).slice(0, 11)
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2')
  }
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

function validCpf(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i)
  let d1 = (sum * 10) % 11
  if (d1 === 10) d1 = 0
  if (d1 !== parseInt(cpf[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i)
  let d2 = (sum * 10) % 11
  if (d2 === 10) d2 = 0
  return d2 === parseInt(cpf[10])
}

function validCnpj(cnpj: string): boolean {
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false
  const calc = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(cnpj[i]) * weights[i]
    const r = sum % 11
    return r < 2 ? 0 : 11 - r
  }
  return calc(12) === parseInt(cnpj[12]) && calc(13) === parseInt(cnpj[13])
}

/** Valida CPF (11 díg.) ou CNPJ (14 díg.) por dígito verificador. */
export function isValidCpfCnpj(value: string): boolean {
  const d = digits(value)
  if (d.length === 11) return validCpf(d)
  if (d.length === 14) return validCnpj(d)
  return false
}

/** Telefone válido: 10 (fixo) ou 11 (celular) dígitos. */
export function isValidPhone(value: string): boolean {
  const len = digits(value).length
  return len === 10 || len === 11
}

/** Máscara CEP 00000-000. */
export function maskCep(value: string): string {
  return digits(value).slice(0, 8).replace(/(\d{5})(\d{1,3})$/, '$1-$2')
}
