import type { useFormularioTurma, useFormularioHorarioTurma, useFormularioVinculoTurma } from './formulario'

import type { EntidadeBase, StatusAtivoInativo } from '@/dominios/comum/types'
import type { Curso, Disciplina, Escola } from '@/dominios/curriculo/types'
import type { Aluno, Professor } from '@/dominios/pessoas/types'

export type StatusTurma = 'ATIVA' | 'INATIVA'

export type StatusMatricula = 'ATIVA' | 'CONCLUIDA' | 'CANCELADA'

export type DiaSemana = 'SEGUNDA' | 'TERCA' | 'QUARTA' | 'QUINTA' | 'SEXTA' | 'SABADO' | 'DOMINGO'

export interface Turma extends EntidadeBase {
  escola: Escola
  titulo: string
  capacidadeMaxima?: number
  curso: Curso
  status?: StatusTurma
  dataInicio?: string
  dataFim?: string
}

export interface HorarioTurma extends EntidadeBase {
  turma?: Turma
  diaSemana: DiaSemana
  horaInicio: string
  horaFim: string
}

export interface TurmaDisciplina extends EntidadeBase {
  turma?: Turma
  disciplina?: Disciplina
  professor?: Professor
  status?: StatusAtivoInativo
}

export interface AlunoTurma extends EntidadeBase {
  aluno: Aluno
  turma: Turma
  dataInicio?: string
  dataFim?: string
  status?: StatusMatricula
}

export interface ResumoFrequenciaAluno {
  alunoId: number
  cargaHoraria: number
  faltas: number
}

export interface DadosMatricula {
  dataInicio: string
  dataFim: string
  status: StatusMatricula
}

export interface DadosTurma {
  titulo: string
  cursoId: number | null
  capacidadeMaxima: string
  dataInicio: string
  dataFim: string
  ativa: boolean
}

export type FormularioTurma = ReturnType<typeof useFormularioTurma>

export interface DadosHorarioTurma {
  diaSemana: DiaSemana | null
  horaInicio: string
  horaFim: string
}

export type FormularioHorarioTurma = ReturnType<typeof useFormularioHorarioTurma>

export interface DadosVinculoTurma {
  disciplinaId: number | null
  professorId: number | null
}

export type FormularioVinculoTurma = ReturnType<typeof useFormularioVinculoTurma>
