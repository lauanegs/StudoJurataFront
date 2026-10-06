import { api } from '@/dominios/comum/api'
import type {
  AlternativaRequest,
  AlternativaResponse,
  ConferenciaDaQuestao,
  FinalizarSimuladoRequest,
  LancarSimuladoRequest,
  QuestaoAlunoResponse,
  QuestaoConteudo,
  QuestaoRequest,
  QuestaoResponse,
  SimuladoAlunoResponse,
  SimuladoQuestaoRequest,
  SimuladoQuestaoResponse,
  SimuladoRequest,
  SimuladoResponse,
} from './types'
import type { ProvaDaTentativa } from './types'

export const questoes = {
  listar: () => api.get<QuestaoResponse[]>('/questoes'),
  buscar: (id: number) => api.get<QuestaoResponse>(`/questoes/${id}`),
  listarPendentes: () => api.get<QuestaoResponse[]>('/questoes/pendentes'),
  criar: (dados: QuestaoRequest) => api.post<QuestaoResponse>('/questoes', dados),
  atualizar: (id: number, dados: QuestaoRequest) =>
    api.put<QuestaoResponse>(`/questoes/${id}`, dados),
  aprovar: (id: number) => api.post<QuestaoResponse>(`/questoes/${id}/aprovar`),
  rejeitar: (id: number) => api.post<QuestaoResponse>(`/questoes/${id}/rejeitar`),
  listarConteudos: (id: number) => api.get<QuestaoConteudo[]>(`/questoes/${id}/conteudos`),
  vincularConteudo: (id: number, conteudoPlanoId: number) =>
    api.post<QuestaoConteudo>(`/questoes/${id}/conteudos/${conteudoPlanoId}`),
  desvincularConteudo: (id: number, conteudoPlanoId: number) =>
    api.delete(`/questoes/${id}/conteudos/${conteudoPlanoId}`),
}

export const alternativas = {
  listar: () => api.get<AlternativaResponse[]>('/alternativas'),
  criar: (dados: AlternativaRequest) => api.post<AlternativaResponse>('/alternativas', dados),
  atualizar: (id: number, dados: AlternativaRequest) =>
    api.put<AlternativaResponse>(`/alternativas/${id}`, dados),
}

export const simulados = {
  listar: () => api.get<SimuladoResponse[]>('/simulados'),
  buscar: (id: number) => api.get<SimuladoResponse>(`/simulados/${id}`),
  criar: (dados: SimuladoRequest) => api.post<SimuladoResponse>('/simulados', dados),
  atualizar: (id: number, dados: SimuladoRequest) =>
    api.put<SimuladoResponse>(`/simulados/${id}`, dados),
  lancar: (id: number, dados?: LancarSimuladoRequest) =>
    api.post<SimuladoResponse>(`/simulados/${id}/lancar`, dados ?? {}),
  encerrar: (id: number) => api.post<SimuladoResponse>(`/simulados/${id}/encerrar`),
  estenderDisponibilidade: (id: number, dataFim: string | null) =>
    api.patch<SimuladoResponse>(`/simulados/${id}/disponibilidade`, { dataFim }),
}

export const simuladoQuestoes = {
  listar: () => api.get<SimuladoQuestaoResponse[]>('/simulado-questao'),
  criar: (dados: SimuladoQuestaoRequest) =>
    api.post<SimuladoQuestaoResponse>('/simulado-questao', dados),
  excluir: (simuladoId: number, questaoId: number) =>
    api.delete(`/simulado-questao/simulado/${simuladoId}/questao/${questaoId}`),
}

export const simuladoAlunos = {
  listar: () => api.get<SimuladoAlunoResponse[]>('/simulado-aluno'),
  buscar: (id: number) => api.get<SimuladoAlunoResponse>(`/simulado-aluno/${id}`),
  listarPorAluno: (alunoId: number) =>
    api.get<SimuladoAlunoResponse[]>(`/simulado-aluno/aluno/${alunoId}`),
  listarPorSimulado: (simuladoId: number) =>
    api.get<SimuladoAlunoResponse[]>(`/simulado-aluno/simulado/${simuladoId}`),
  finalizar: (id: number, dados: FinalizarSimuladoRequest) =>
    api.post<SimuladoAlunoResponse>(`/simulado-aluno/${id}/finalizar`, dados),
  conferirQuestao: (id: number, resposta: FinalizarSimuladoRequest['respostas'][number]) =>
    api.post<ConferenciaDaQuestao>(`/simulado-aluno/${id}/conferir-questao`, resposta),
  questoesDaTentativa: (id: number) => api.get<ProvaDaTentativa>(`/simulado-aluno/${id}/questoes`),
}

export const questaoAlunos = {
  listar: () => api.get<QuestaoAlunoResponse[]>('/questao-aluno'),
  listarPorSimuladoAluno: (simuladoAlunoId: number) =>
    api.get<QuestaoAlunoResponse[]>(`/questao-aluno/simulado-aluno/${simuladoAlunoId}`),
}
