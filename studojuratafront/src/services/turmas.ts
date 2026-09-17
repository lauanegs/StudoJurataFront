import { api } from './api'
import type {
  AlunoTurma,
  HorarioTurma,
  ResumoFrequenciaAluno,
  Turma,
  TurmaDisciplina,
} from '../types/turmas'

export const turmas = {
  listar: () => api.get<Turma[]>('/turmas'),
  buscar: (id: number) => api.get<Turma>(`/turmas/${id}`),
  /** Derivado das matrículas — a Turma não persiste esse número. */
  alunosAtivos: (id: number) => api.get<number>(`/turmas/${id}/alunos-ativos`),
  /** Carga horária cursada e faltas de cada aluno ativo, calculadas no back. */
  frequenciaAlunos: (id: number) => api.get<ResumoFrequenciaAluno[]>(`/turmas/${id}/frequencia-alunos`),
  criar: (dados: Partial<Turma>) => api.post<Turma>('/turmas', dados),
  atualizar: (id: number, dados: Partial<Turma>) => api.put<Turma>(`/turmas/${id}`, dados),
  excluir: (id: number) => api.delete(`/turmas/${id}`),
  ativar: (id: number) => api.post<Turma>(`/turmas/${id}/ativar`),
}

export const horariosTurma = {
  listarPorTurma: (turmaId: number) => api.get<HorarioTurma[]>(`/turmas/${turmaId}/horarios`),
  adicionar: (turmaId: number, dados: Partial<HorarioTurma>) =>
    api.post<HorarioTurma>(`/turmas/${turmaId}/horarios`, dados),
  remover: (id: number) => api.delete(`/horarios/${id}`),
}

export const turmaDisciplinas = {
  listar: () => api.get<TurmaDisciplina[]>('/turma-disciplina'),
  criar: (dados: Partial<TurmaDisciplina>) =>
    api.post<TurmaDisciplina>('/turma-disciplina', dados),
  excluir: (id: number) => api.delete(`/turma-disciplina/${id}`),
}

export const matriculas = {
  listar: () => api.get<AlunoTurma[]>('/aluno-turma'),
  buscar: (id: number) => api.get<AlunoTurma>(`/aluno-turma/${id}`),
  historicoPorTurma: (turmaId: number) =>
    api.get<AlunoTurma[]>(`/aluno-turma/turma/${turmaId}/historico`),
  ativosPorTurma: (turmaId: number) => api.get<AlunoTurma[]>(`/aluno-turma/turma/${turmaId}/ativos`),
  matricular: (dados: Partial<AlunoTurma>) => api.post<AlunoTurma>('/aluno-turma', dados),
  atualizar: (id: number, dados: Partial<AlunoTurma>) =>
    api.put<AlunoTurma>(`/aluno-turma/${id}`, dados),
}
