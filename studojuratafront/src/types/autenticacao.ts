import type { TipoUsuario } from './comum'

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
