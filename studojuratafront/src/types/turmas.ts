import type { EntidadeBase, StatusAtivoInativo } from './comum'
import type { Curso, Disciplina, Escola } from './curriculo'
import type { Aluno, Professor } from './pessoas'

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
  /** Formato HH:mm:ss vindo de java.time.LocalTime. */
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

/** Resposta de GET /turmas/{id}/frequencia-alunos (FrequenciaService.ResumoFrequenciaAluno). */
export interface ResumoFrequenciaAluno {
  alunoId: number
  cargaHoraria: number
  faltas: number
}
