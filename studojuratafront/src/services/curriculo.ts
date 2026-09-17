import { api } from './api'
import type { Curso, CursoDisciplina, Disciplina, Escola } from '../types/curriculo'

export const escolas = {
  listar: () => api.get<Escola[]>('/escolas'),
}

export const cursos = {
  listar: () => api.get<Curso[]>('/cursos'),
  buscar: (id: number) => api.get<Curso>(`/cursos/${id}`),
  criar: (dados: Partial<Curso>) => api.post<Curso>('/cursos', dados),
  atualizar: (id: number, dados: Partial<Curso>) => api.put<Curso>(`/cursos/${id}`, dados),
  excluir: (id: number) => api.delete(`/cursos/${id}`),
  ativar: (id: number) => api.post<Curso>(`/cursos/${id}/ativar`),
}

/** Grade curricular: disciplinas + carga horária de cada curso (ver CursoDisciplina). */
export const cursoDisciplinas = {
  listarPorCurso: (cursoId: number) => api.get<CursoDisciplina[]>(`/cursos/${cursoId}/disciplinas`),
  criar: (dados: Partial<CursoDisciplina>) => api.post<CursoDisciplina>('/curso-disciplina', dados),
  excluir: (id: number) => api.delete(`/curso-disciplina/${id}`),
}

export const disciplinas = {
  listar: () => api.get<Disciplina[]>('/disciplinas'),
  buscar: (id: number) => api.get<Disciplina>(`/disciplinas/${id}`),
  criar: (dados: Partial<Disciplina>) => api.post<Disciplina>('/disciplinas', dados),
  atualizar: (id: number, dados: Partial<Disciplina>) =>
    api.put<Disciplina>(`/disciplinas/${id}`, dados),
  excluir: (id: number) => api.delete(`/disciplinas/${id}`),
  ativar: (id: number) => api.post<Disciplina>(`/disciplinas/${id}/ativar`),
}
