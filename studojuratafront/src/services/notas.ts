import { api } from './api'
import type { Nota } from '../types/notas'

export const notas = {
  /** Restrito a PROFESSOR/ADMINISTRADOR no SecurityConfig. */
  listar: () => api.get<Nota[]>('/notas'),
  historicoPorAluno: (alunoId: number) => api.get<Nota[]>(`/notas/aluno/${alunoId}/historico`),
}
