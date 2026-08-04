/**
 * Cliente HTTP do StudoJurata.
 *
 * O back usa sessão via cookie (Spring Security com HttpSessionSecurityContext
 * Repository), então toda requisição precisa de `credentials: 'include'` — sem
 * isso o servidor devolve 401 mesmo depois do login.
 */

/**
 * Base das requisições.
 *
 * O padrão `/api` é servido pelo proxy do Vite (ver vite.config.ts), o que
 * mantém front e back na mesma origem em desenvolvimento — sem CORS e com o
 * cookie de sessão funcionando naturalmente. Em produção, defina
 * `VITE_API_BASE_URL` com a URL absoluta da API.
 */
export const API_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '/api'

export class ApiError extends Error {
  readonly status: number
  readonly corpo: unknown

  constructor(status: number, mensagem: string, corpo?: unknown) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.corpo = corpo
  }

  get naoAutenticado() {
    return this.status === 401
  }

  get semPermissao() {
    return this.status === 403
  }

  get naoEncontrado() {
    return this.status === 404
  }

  get erroDeNegocio() {
    return this.status === 400 || this.status === 409 || this.status === 422
  }
}

type Parametros = Record<string, string | number | boolean | undefined | null>

interface OpcoesRequisicao extends Omit<RequestInit, 'body'> {
  params?: Parametros
  body?: unknown
}

const ouvintesSessaoExpirada = new Set<() => void>()

export function aoExpirarSessao(ouvinte: () => void) {
  ouvintesSessaoExpirada.add(ouvinte)
  return () => ouvintesSessaoExpirada.delete(ouvinte)
}

function montarUrl(caminho: string, params?: Parametros) {
  const rota = caminho.startsWith('/') ? caminho : `/${caminho}`

  // `origin` é só a referência para bases relativas ("/api"); quando
  // API_BASE_URL é absoluta, ela prevalece.
  const url = new URL(
    `${API_BASE_URL}${rota}`,
    typeof window === 'undefined' ? 'http://localhost' : window.location.origin,
  )

  if (params) {
    Object.entries(params).forEach(([chave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        url.searchParams.set(chave, String(valor))
      }
    })
  }

  return url.toString()
}

/** Extrai a mensagem mais útil do corpo de erro do GlobalExceptionHandler. */
function mensagemDoErro(status: number, corpo: unknown): string {
  if (corpo && typeof corpo === 'object') {
    const dados = corpo as Record<string, unknown>

    if (typeof dados.mensagem === 'string') return dados.mensagem
    if (typeof dados.message === 'string') return dados.message
    if (typeof dados.error === 'string') return dados.error

    // Erros de @Valid chegam como { campo: "mensagem" }.
    const primeiro = Object.values(dados).find((v) => typeof v === 'string')
    if (typeof primeiro === 'string') return primeiro
  }

  const padroes: Record<number, string> = {
    400: 'Dados inválidos. Revise os campos e tente novamente.',
    401: 'Sua sessão expirou. Faça login novamente.',
    403: 'Você não tem permissão para executar esta ação.',
    404: 'Registro não encontrado.',
    409: 'Já existe um registro com estes dados.',
    500: 'Erro interno no servidor. Tente novamente em instantes.',
  }

  return padroes[status] ?? `Erro ${status} ao comunicar com o servidor.`
}

async function requisitar<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
  const { params, body, headers, ...resto } = opcoes

  let resposta: Response

  try {
    resposta = await fetch(montarUrl(caminho, params), {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...resto,
    })
  } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor. Verifique sua conexão.')
  }

  if (resposta.status === 204 || resposta.status === 205) {
    return undefined as T
  }

  const texto = await resposta.text()
  const corpo = texto ? (safeJson(texto) ?? texto) : null

  if (!resposta.ok) {
    if (resposta.status === 401) {
      ouvintesSessaoExpirada.forEach((ouvinte) => ouvinte())
    }
    throw new ApiError(resposta.status, mensagemDoErro(resposta.status, corpo), corpo)
  }

  return corpo as T
}

function safeJson(texto: string): unknown {
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}

export const api = {
  get: <T>(caminho: string, params?: Parametros) =>
    requisitar<T>(caminho, { method: 'GET', params }),

  post: <T>(caminho: string, body?: unknown, params?: Parametros) =>
    requisitar<T>(caminho, { method: 'POST', body, params }),

  put: <T>(caminho: string, body?: unknown, params?: Parametros) =>
    requisitar<T>(caminho, { method: 'PUT', body, params }),

  delete: <T = void>(caminho: string, params?: Parametros) =>
    requisitar<T>(caminho, { method: 'DELETE', params }),
}
