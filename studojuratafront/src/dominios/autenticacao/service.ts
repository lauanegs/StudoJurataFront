import { api } from '@/dominios/comum/api'
import type { LoginRequest, LoginResponse } from './types'

export const autenticacao = {
  entrar: (dados: LoginRequest) => api.post<LoginResponse>('/auth/login', dados),
  sair: () => api.post<void>('/auth/logout'),
  usuarioAtual: () => api.get<LoginResponse>('/auth/me'),
}
