import type { TipoUsuario } from '@/dominios/comum/types'

export interface LoginRequest {
  username: string
  senha: string
}

export interface LoginResponse {
  usuarioId: number
  username: string
  tipoUsuario: TipoUsuario
  pessoaId: number | null
  nomePessoa: string | null
}
