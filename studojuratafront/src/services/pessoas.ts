import { api } from './api'
import type {
  Aluno,
  Pessoa,
  Professor,
  Responsavel,
  ResponsavelAluno,
  Usuario,
} from '../types/pessoas'
import type { TurmaDisciplina } from '../types/turmas'

export const pessoas = {
  listar: () => api.get<Pessoa[]>('/pessoas'),
  criar: (dados: Partial<Pessoa>) => api.post<Pessoa>('/pessoas', dados),
  atualizar: (id: number, dados: Partial<Pessoa>) => api.put<Pessoa>(`/pessoas/${id}`, dados),
}

export const alunos = {
  listar: () => api.get<Aluno[]>('/alunos'),
  buscar: (id: number) => api.get<Aluno>(`/alunos/${id}`),
  criar: (dados: Partial<Aluno>) => api.post<Aluno>('/alunos', dados),
  atualizar: (id: number, dados: Partial<Aluno>) => api.put<Aluno>(`/alunos/${id}`, dados),
  excluir: (id: number) => api.delete(`/alunos/${id}`),
  ativar: (id: number) => api.post<Aluno>(`/alunos/${id}/ativar`),
}

export const professores = {
  listar: () => api.get<Professor[]>('/professores'),
  buscar: (id: number) => api.get<Professor>(`/professores/${id}`),
  turmasLecionadas: (id: number) => api.get<TurmaDisciplina[]>(`/professores/${id}/turmas`),
  criar: (dados: Partial<Professor>) => api.post<Professor>('/professores', dados),
  atualizar: (id: number, dados: Partial<Professor>) =>
    api.put<Professor>(`/professores/${id}`, dados),
  excluir: (id: number) => api.delete(`/professores/${id}`),
  ativar: (id: number) => api.post<Professor>(`/professores/${id}/ativar`),
}

export const responsaveis = {
  listar: () => api.get<Responsavel[]>('/responsaveis'),
  buscar: (id: number) => api.get<Responsavel>(`/responsaveis/${id}`),
  criar: (dados: Partial<Responsavel>) => api.post<Responsavel>('/responsaveis', dados),
  atualizar: (id: number, dados: Partial<Responsavel>) =>
    api.put<Responsavel>(`/responsaveis/${id}`, dados),
  excluir: (id: number) => api.delete(`/responsaveis/${id}`),
  ativar: (id: number) => api.post<Responsavel>(`/responsaveis/${id}/ativar`),
}

export const vinculosResponsavel = {
  porAluno: (alunoId: number) => api.get<ResponsavelAluno[]>(`/responsavel-aluno/por-aluno/${alunoId}`),
  porResponsavel: (responsavelId: number) =>
    api.get<ResponsavelAluno[]>(`/responsavel-aluno/por-responsavel/${responsavelId}`),
  criar: (dados: Partial<ResponsavelAluno>) =>
    api.post<ResponsavelAluno>('/responsavel-aluno', dados),
  atualizar: (id: number, dados: Partial<ResponsavelAluno>) =>
    api.put<ResponsavelAluno>(`/responsavel-aluno/${id}`, dados),
  aceitarTermos: (id: number, textoVersao: string) =>
    api.post<ResponsavelAluno>(`/responsavel-aluno/${id}/aceitar-termos`, { textoVersao }),
  excluir: (id: number) => api.delete(`/responsavel-aluno/${id}`),
}

export const usuarios = {
  listar: () => api.get<Usuario[]>('/usuarios'),
  buscar: (id: number) => api.get<Usuario>(`/usuarios/${id}`),
  criar: (dados: Partial<Usuario>) => api.post<Usuario>('/usuarios', dados),
  atualizar: (id: number, dados: Partial<Usuario>) => api.put<Usuario>(`/usuarios/${id}`, dados),
  excluir: (id: number) => api.delete(`/usuarios/${id}`),
  ativar: (id: number) => api.post<Usuario>(`/usuarios/${id}/ativar`),
}
