import type { useFormularioGradeCurso } from './formulario'

import type { EntidadeBase, StatusAtivoInativo } from '@/dominios/comum/types'

export interface Escola extends EntidadeBase {
  nome: string
  cnpj?: string
  status?: StatusAtivoInativo
}

export interface Curso extends EntidadeBase {
  escola: Escola
  nome: string
  descricao?: string
  cargaHorariaTotal?: number
  status?: StatusAtivoInativo
}

export interface Disciplina extends EntidadeBase {
  escola: Escola
  titulo: string
  status?: StatusAtivoInativo
}

export interface CursoDisciplina extends EntidadeBase {
  curso: Curso
  disciplina: Disciplina
  cargaHoraria?: number
  status?: StatusAtivoInativo
}

export interface DadosDisciplina {
  titulo: string
  ativa: boolean
}

export interface DadosCurso {
  nome: string
  descricao: string
  ativo: boolean
}

export interface DadosGradeCurso {
  disciplinaId: number | null
  cargaHoraria: string
}

export type FormularioGradeCurso = ReturnType<typeof useFormularioGradeCurso>
