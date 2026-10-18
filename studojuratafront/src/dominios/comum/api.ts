import type { Parametros } from './types'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')

const MENSAGENS_PADRAO: Record<number, string> = {
  400: 'Dados inválidos. Revise os campos e tente novamente.',
  401: 'Sua sessão expirou. Faça login novamente.',
  403: 'Você não tem permissão para executar esta ação.',
  404: 'Registro não encontrado.',
  409: 'Já existe um registro com estes dados.',
  500: 'Erro interno no servidor. Tente novamente em instantes.',
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, mensagem: string) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
  }
}

const ouvintesSessaoExpirada = new Set<() => void>()

export function aoExpirarSessao(ouvinte: () => void) {
  ouvintesSessaoExpirada.add(ouvinte)
  return () => ouvintesSessaoExpirada.delete(ouvinte)
}

function montarUrl(caminho: string, params?: Parametros) {
  const url = new URL(`${BASE_URL}${caminho}`, window.location.origin)

  Object.entries(params ?? {}).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') url.searchParams.set(chave, String(valor))
  })

  return url.toString()
}

function lerCorpo(texto: string) {
  try {
    return JSON.parse(texto)
  } catch {
    return texto
  }
}

// Erros do GlobalExceptionHandler chegam como { mensagem } ou, em @Valid, como { campo: "mensagem" }
function mensagemDoErro(status: number, corpo: Record<string, string> | string | null) {
  if (corpo && typeof corpo === 'object') {
    const mensagem = [corpo.mensagem, corpo.message, corpo.error, ...Object.values(corpo)].find(
      (valor) => typeof valor === 'string',
    )
    if (mensagem) return mensagem
  }

  return MENSAGENS_PADRAO[status] ?? `Erro ${status} ao comunicar com o servidor.`
}

async function requisitar<T>(metodo: string, caminho: string, params?: Parametros, body?: object): Promise<T> {
  let resposta: Response

  try {
    resposta = await fetch(montarUrl(caminho, params), {
      method: metodo,
      credentials: 'include',
      headers: { Accept: 'application/json', ...(body && { 'Content-Type': 'application/json' }) },
      body: body && JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.')
  }

  const texto = await resposta.text()
  const corpo = texto ? lerCorpo(texto) : null

  if (!resposta.ok) {
    if (resposta.status === 401) ouvintesSessaoExpirada.forEach((ouvinte) => ouvinte())
    throw new ApiError(resposta.status, mensagemDoErro(resposta.status, corpo))
  }

  return corpo
}

export const api = {
  get: <T>(caminho: string, params?: Parametros) => requisitar<T>('GET', caminho, params),
  post: <T>(caminho: string, body?: object) => requisitar<T>('POST', caminho, undefined, body),
  put: <T>(caminho: string, body?: object) => requisitar<T>('PUT', caminho, undefined, body),
  patch: <T>(caminho: string, body?: object) => requisitar<T>('PATCH', caminho, undefined, body),
  delete: <T = void>(caminho: string) => requisitar<T>('DELETE', caminho),
}
