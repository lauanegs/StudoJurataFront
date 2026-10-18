import { api } from '@/dominios/comum/api'
import type {
  Aula,
  AulaConteudo,
  ChamadaRequest,
  ConteudoPlano,
  EstatisticasPlanoAula,
  Frequencia,
  GerarAulasLoteRequest,
  PlanoAula,
  PlanoEnsino,
} from './types'

export const planosEnsino = {
  listar: () => api.get<PlanoEnsino[]>('/plano-ensino'),
  buscar: (id: number) => api.get<PlanoEnsino>(`/plano-ensino/${id}`),
  criar: (dados: Partial<PlanoEnsino>) => api.post<PlanoEnsino>('/plano-ensino', dados),
  atualizar: (id: number, dados: Partial<PlanoEnsino>) =>
    api.put<PlanoEnsino>(`/plano-ensino/${id}`, dados),
  excluir: (id: number) => api.delete(`/plano-ensino/${id}`),
}

export const conteudosPlano = {
  listar: () => api.get<ConteudoPlano[]>('/conteudo-plano'),
  buscar: (id: number) => api.get<ConteudoPlano>(`/conteudo-plano/${id}`),
  criar: (dados: Partial<ConteudoPlano>) => api.post<ConteudoPlano>('/conteudo-plano', dados),
  atualizar: (id: number, dados: Partial<ConteudoPlano>) =>
    api.put<ConteudoPlano>(`/conteudo-plano/${id}`, dados),
  excluir: (id: number) => api.delete(`/conteudo-plano/${id}`),
}

export const planosAula = {
  listar: () => api.get<PlanoAula[]>('/plano-aula'),
  buscar: (id: number) => api.get<PlanoAula>(`/plano-aula/${id}`),
  listarPorTurmaDisciplina: (turmaDisciplinaId: number) =>
    api.get<PlanoAula[]>(`/plano-aula/turma-disciplina/${turmaDisciplinaId}`),
  listarPorPlanoEnsino: (planoEnsinoId: number) =>
    api.get<PlanoAula[]>(`/plano-aula/plano-ensino/${planoEnsinoId}`),
  estatisticas: (id: number) => api.get<EstatisticasPlanoAula>(`/plano-aula/${id}/estatisticas`),
  atualizar: (id: number, dados: Partial<PlanoAula>) =>
    api.put<PlanoAula>(`/plano-aula/${id}`, dados),
  excluir: (id: number) => api.delete(`/plano-aula/${id}`),
}

export const aulas = {
  buscar: (id: number) => api.get<Aula>(`/aulas/${id}`),
  listarPorPlanoAula: (planoAulaId: number) => api.get<Aula[]>(`/aulas/plano-aula/${planoAulaId}`),
  criar: (dados: Partial<Aula>) => api.post<Aula>('/aulas', dados),
  atualizar: (id: number, dados: Partial<Aula>) => api.put<Aula>(`/aulas/${id}`, dados),
  publicar: (id: number, dataPublicacao?: string) =>
    api.post<Aula>(`/aulas/${id}/publicar${dataPublicacao ? `?dataPublicacao=${encodeURIComponent(dataPublicacao)}` : ''}`),
  excluir: (id: number) => api.delete(`/aulas/${id}`),
  gerarLote: (planoAulaId: number, dados: GerarAulasLoteRequest) =>
    api.post<Aula[]>(`/aulas/plano-aula/${planoAulaId}/gerar-lote`, dados),

  listarConteudos: (id: number) => api.get<AulaConteudo[]>(`/aulas/${id}/conteudos`),
  vincularConteudo: (id: number, conteudoPlanoId: number) =>
    api.post<AulaConteudo>(`/aulas/${id}/conteudos/${conteudoPlanoId}`),
  desvincularConteudo: (id: number, conteudoPlanoId: number) =>
    api.delete(`/aulas/${id}/conteudos/${conteudoPlanoId}`),

  listarFrequencias: (id: number) => api.get<Frequencia[]>(`/aulas/${id}/frequencias`),
  registrarChamada: (id: number, dados: ChamadaRequest) =>
    api.post<Frequencia[]>(`/aulas/${id}/frequencias/chamada`, dados),
}

export const frequencias = {
  listarPorAluno: (alunoId: number) => api.get<Frequencia[]>(`/frequencia/aluno/${alunoId}`),
}
