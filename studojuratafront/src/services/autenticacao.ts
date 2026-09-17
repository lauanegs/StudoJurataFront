import { api } from './api'
import type { LoginRequest, LoginResponse } from '../types/autenticacao'

export const autenticacao = {
  entrar: (dados: LoginRequest) => api.post<LoginResponse>('/auth/login', dados),
  sair: () => api.post<void>('/auth/logout'),
  usuarioAtual: () => api.get<LoginResponse>('/auth/me'),
}
