/**
 * Regras de validação de formulário. Espelham as constraints do back
 * (@NotBlank, @NotNull, unique, length) para que o erro apareça antes do
 * request, e não como 400 genérico.
 */

export type Validador<T = string> = (valor: T) => string | null

export const required =
  (mensagem = 'Campo obrigatório'): Validador<unknown> =>
  (valor) => {
    if (valor === null || valor === undefined) return mensagem
    if (typeof valor === 'string' && valor.trim() === '') return mensagem
    if (Array.isArray(valor) && valor.length === 0) return mensagem
    return null
  }

export const tamanhoMinimo =
  (minimo: number, mensagem?: string): Validador =>
  (valor) =>
    !valor || valor.trim().length >= minimo
      ? null
      : (mensagem ?? `Informe ao menos ${minimo} caracteres`)

export const tamanhoMaximo =
  (maximo: number, mensagem?: string): Validador =>
  (valor) =>
    !valor || valor.length <= maximo ? null : (mensagem ?? `Máximo de ${maximo} caracteres`)

export const email: Validador = (valor) => {
  if (!valor) return null
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor.trim()) ? null : 'E-mail inválido'
}

/** Validação real de CPF (dígitos verificadores), não só a máscara. */
export function cpfValido(valor: string): boolean {
  const digitos = valor.replace(/\D/g, '')

  if (digitos.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digitos)) return false

  const calcular = (ate: number) => {
    let soma = 0
    for (let i = 0; i < ate; i += 1) {
      soma += Number(digitos[i]) * (ate + 1 - i)
    }
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  return calcular(9) === Number(digitos[9]) && calcular(10) === Number(digitos[10])
}

export const cpf: Validador = (valor) => {
  if (!valor) return null
  return cpfValido(valor) ? null : 'CPF inválido'
}

export const telefone: Validador = (valor) => {
  if (!valor) return null
  const digitos = valor.replace(/\D/g, '')
  return digitos.length === 10 || digitos.length === 11 ? null : 'Telefone inválido'
}

export const cnpj: Validador = (valor) => {
  if (!valor) return null
  return valor.replace(/\D/g, '').length === 14 ? null : 'CNPJ inválido'
}

export const numeroPositivo =
  (mensagem = 'Informe um número maior que zero'): Validador<string | number | null | undefined> =>
  (valor) => {
    if (valor === '' || valor === null || valor === undefined) return null
    const numero = Number(valor)
    return Number.isFinite(numero) && numero > 0 ? null : mensagem
  }

export const numeroEntre =
  (minimo: number, maximo: number, mensagem?: string): Validador<string | number | null | undefined> =>
  (valor) => {
    if (valor === '' || valor === null || valor === undefined) return null
    const numero = Number(valor)
    if (!Number.isFinite(numero)) return mensagem ?? 'Valor inválido'
    return numero >= minimo && numero <= maximo
      ? null
      : (mensagem ?? `Informe um valor entre ${minimo} e ${maximo}`)
  }

export const dataValida: Validador = (valor) => {
  if (!valor) return null
  return Number.isNaN(new Date(valor).getTime()) ? 'Data inválida' : null
}

export const dataNaoFutura: Validador = (valor) => {
  if (!valor) return null
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return 'Data inválida'
  return data.getTime() > Date.now() ? 'A data não pode ser futura' : null
}

/** Período letivo no formato aceito pelo back: "2026" ou "2026/1". */
export const periodoLetivo: Validador = (valor) => {
  if (!valor) return null
  return /^\d{4}(\/[1-4])?$/.test(valor.trim())
    ? null
    : 'Use o formato 2026 ou 2026/1'
}

export function combinar<T>(...validadores: Validador<T>[]): Validador<T> {
  return (valor) => {
    for (const validador of validadores) {
      const erro = validador(valor)
      if (erro) return erro
    }
    return null
  }
}

export function intervaloDeDatas(inicio?: string | null, fim?: string | null): string | null {
  if (!inicio || !fim) return null

  return new Date(fim).getTime() < new Date(inicio).getTime()
    ? 'A data final deve ser posterior à data inicial'
    : null
}

/** Somente dígitos — útil para enviar CPF/telefone ao back sem máscara. */
export function apenasDigitos(valor?: string | null): string {
  return (valor ?? '').replace(/\D/g, '')
}
