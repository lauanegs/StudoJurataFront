const INVALIDO = '—'

function paraData(valor?: string | Date | null): Date | null {
  if (!valor) return null

  // "2026-07-20" sem horário é interpretado como UTC pelo Date; forçamos
  // horário local para não exibir o dia anterior.
  const data =
    typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)
      ? new Date(`${valor}T00:00:00`)
      : typeof valor === 'string'
        ? new Date(valor)
        : valor

  return Number.isNaN(data.getTime()) ? null : data
}

export function formatarData(valor?: string | Date | null): string {
  const data = paraData(valor)
  return data ? data.toLocaleDateString('pt-BR') : INVALIDO
}

export function formatarDataHora(valor?: string | Date | null): string {
  const data = paraData(valor)
  if (!data) return INVALIDO

  return `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

const MESES_ABREVIADOS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

function formatarMesAno(valor?: string | Date | null): string {
  const data = paraData(valor)
  return data ? `${MESES_ABREVIADOS[data.getMonth()]}/${data.getFullYear()}` : INVALIDO
}

/** Período de um plano de ensino/aula: "mês/aaaa – mês/aaaa" — só mês/ano, o dia é ruído visual pra essa granularidade. */
export function formatarPeriodo(dataInicio?: string | null, dataFim?: string | null): string {
  const inicio = formatarMesAno(dataInicio)
  const fim = formatarMesAno(dataFim)
  if (inicio === INVALIDO && fim === INVALIDO) return INVALIDO
  if (fim === INVALIDO) return inicio
  if (inicio === INVALIDO) return fim
  return `${inicio} – ${fim}`
}

export function formatarHora(valor?: string | null): string {
  if (!valor) return INVALIDO
  // LocalTime chega como "08:00:00".
  return valor.slice(0, 5)
}

export function paraInputDataHora(valor?: string | null): string {
  if (!valor) return ''
  return valor.slice(0, 16)
}

/** Converte "2026-07-20T11:00" para o formato que o back espera (LocalDateTime). */
export function deInputDataHora(valor?: string | null): string | null {
  if (!valor) return null
  return valor.length === 16 ? `${valor}:00` : valor
}

export function paraInputData(valor?: string | null): string {
  if (!valor) return ''
  return valor.slice(0, 10)
}

export function formatarCpf(cpf?: string | null): string {
  if (!cpf) return INVALIDO

  const digitos = cpf.replace(/\D/g, '').slice(0, 11)

  return digitos
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function formatarTelefone(telefone?: string | null): string {
  if (!telefone) return INVALIDO

  const digitos = telefone.replace(/\D/g, '').slice(0, 11)

  if (digitos.length <= 10) {
    return digitos.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  }

  return digitos.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}

export function formatarCep(cep?: string | null): string {
  if (!cep) return INVALIDO

  const digitos = cep.replace(/\D/g, '').slice(0, 8)

  return digitos.replace(/(\d{5})(\d)/, '$1-$2')
}

export function formatarCnpj(cnpj?: string | null): string {
  if (!cnpj) return INVALIDO

  return cnpj
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export function calcularIdade(dataNascimento?: string | null): number | null {
  const nascimento = paraData(dataNascimento)
  if (!nascimento) return null

  const hoje = new Date()
  let idade = hoje.getFullYear() - nascimento.getFullYear()

  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())

  if (aindaNaoFezAniversario) idade -= 1

  return idade
}

export function formatarIdade(dataNascimento?: string | null): string {
  const idade = calcularIdade(dataNascimento)
  return idade === null ? INVALIDO : `${idade} anos`
}

export function formatarTempo(segundos?: number | null): string {
  if (segundos === null || segundos === undefined || Number.isNaN(segundos)) return INVALIDO

  const total = Math.max(0, Math.floor(segundos))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  const pad = (n: number) => String(n).padStart(2, '0')

  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export function formatarDuracaoMinutos(minutos?: number | null): string {
  if (!minutos) return INVALIDO

  const h = Math.floor(minutos / 60)
  const m = minutos % 60

  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export function formatarNota(nota?: number | null, casas = 1): string {
  if (nota === null || nota === undefined) return INVALIDO
  return nota.toFixed(casas).replace('.', ',')
}

export function formatarPorcentagem(valor?: number | null, casas = 0): string {
  if (valor === null || valor === undefined) return INVALIDO
  return `${valor.toFixed(casas).replace('.', ',')}%`
}

export function formatarMoedas(valor?: number | null): string {
  if (valor === null || valor === undefined) return '0'
  return valor.toLocaleString('pt-BR')
}

export function formatarCargaHoraria(horas?: number | null): string {
  return horas === null || horas === undefined ? INVALIDO : `${horas}h`
}

export function nomeCurto(nome?: string | null): string {
  if (!nome) return INVALIDO

  const partes = nome.trim().split(/\s+/)
  if (partes.length === 1) return partes[0]

  return `${partes[0]} ${partes[partes.length - 1]}`
}

export function iniciais(nome?: string | null): string {
  if (!nome) return '?'

  const partes = nome.trim().split(/\s+/)
  const primeira = partes[0]?.[0] ?? ''
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''

  return `${primeira}${ultima}`.toUpperCase()
}

export function normalizar(texto?: string | null): string {
  return (texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function pluralizar(quantidade: number, singular: string, plural: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`
}

export function letraAlternativa(indice: number): string {
  return String.fromCharCode(65 + indice)
}
