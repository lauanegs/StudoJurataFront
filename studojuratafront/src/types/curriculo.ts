import type { EntidadeBase, StatusAtivoInativo } from './comum'

export interface Escola extends EntidadeBase {
  nome: string
  cnpj?: string
  status?: StatusAtivoInativo
}

export interface Curso extends EntidadeBase {
  escola: Escola
  nome: string
  descricao?: string
  /** Soma das cargas horárias ativas da grade curricular (CursoDisciplina) — não editável diretamente. */
  cargaHorariaTotal?: number
  status?: StatusAtivoInativo
}

export interface Disciplina extends EntidadeBase {
  escola: Escola
  titulo: string
  status?: StatusAtivoInativo
}

/** Grade curricular: disciplinas do curso com a carga horária de cada uma. */
export interface CursoDisciplina extends EntidadeBase {
  curso: Curso
  disciplina: Disciplina
  cargaHoraria?: number
  status?: StatusAtivoInativo
}
