export function formatarData(data: string | Date): string {
  const d = typeof data === 'string' ? new Date(data) : data
  if (Number.isNaN(d.getTime())) return ''

  return d.toLocaleDateString('pt-BR')
}

export function formatarDataHora(data: string | Date): string {
  const d = typeof data === 'string' ? new Date(data) : data
  if (Number.isNaN(d.getTime())) return ''

  return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

export function formatarCpf(cpf: string): string {
  const digits = cpf.replace(/\D/g, '').slice(0, 11)

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatarCelular(celular: string): string {
  const digits = celular.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export function calcularIdade(dataNascimento: string): number {
  const nascimento = new Date(dataNascimento)
  if (Number.isNaN(nascimento.getTime())) return 0

  const hoje = new Date()
  let idade = hoje.getFullYear() - nascimento.getFullYear()
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())

  if (aindaNaoFezAniversario) idade -= 1

  return idade
}

export function formatarTempo(segundos: number): string {
  const h = Math.floor(segundos / 3600)
  const m = Math.floor((segundos % 3600) / 60)
  const s = Math.floor(segundos % 60)

  const pad = (n: number) => String(n).padStart(2, '0')

  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}
