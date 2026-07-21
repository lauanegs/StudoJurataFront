// Camada de acesso a dados do StudoJurata.
//
// Hoje o front-end trabalha com dados mockados (ver cada página em src/pages),
// então este serviço só concentra a configuração básica que será usada quando
// o backend (Spring Boot) estiver integrado. Nenhuma tela depende deste
// arquivo para funcionar enquanto os mocks estiverem em uso.

export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:8080'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>
}

function buildUrl(path: string, params?: RequestOptions['params']) {
  const url = new URL(path.replace(/^\//, ''), `${API_BASE_URL}/`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value))
    })
  }

  return url.toString()
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options

  const response = await fetch(buildUrl(path, params), {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  })

  if (!response.ok) {
    throw new Error(`Erro ${response.status} ao chamar ${path}`)
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(path: string, params?: RequestOptions['params']) =>
    request<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
