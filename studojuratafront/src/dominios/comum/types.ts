export type TipoUsuario = 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO'

export type StatusAtivoInativo = 'ATIVO' | 'INATIVO'

export interface EntidadeBase {
  id: number
  createdAt?: string
  updatedAt?: string
}

export type Parametros = Record<string, string | number | boolean | undefined | null>

export interface OpcoesRequisicao extends Omit<RequestInit, 'body'> {
  params?: Parametros
  body?: unknown
}
