/**
 * Regras de validação de formulário. Espelham as constraints do back
 * (@NotBlank, @NotNull, unique, length) para que o erro apareça antes do
 * request, e não como 400 genérico.
 */

export type Validador<T = string> = (valor: T) => string | null

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
