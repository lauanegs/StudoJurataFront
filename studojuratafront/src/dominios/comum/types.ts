/** Tipos espelham os DTOs e entidades do StudoJurataApi: se o back não devolve um campo, a tela não exibe. */
export type TipoUsuario = 'ADMINISTRADOR' | 'PROFESSOR' | 'ALUNO'

export type StatusAtivoInativo = 'ATIVO' | 'INATIVO'

export interface EntidadeBase {
  id: number
  createdAt?: string
  updatedAt?: string
}
