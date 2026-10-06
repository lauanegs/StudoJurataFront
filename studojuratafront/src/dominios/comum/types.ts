export type TipoUsuario = 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO'

export type StatusAtivoInativo = 'ATIVO' | 'INATIVO'

export interface EntidadeBase {
  id: number
  createdAt?: string
  updatedAt?: string
}
