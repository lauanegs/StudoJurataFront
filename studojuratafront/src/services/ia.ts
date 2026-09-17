import { api } from './api'
import type {
  GerarSimuladoIARequest,
  Recomendacao,
  RevisaoConteudoResponse,
  SimuladoGeradoIAResponse,
} from '../types/ia'
import type { SimuladoResponse } from '../types/simulados'

export const ia = {
  gerarSimulado: (dados: GerarSimuladoIARequest) =>
    api.post<SimuladoResponse>('/ia/geracao/simulado', dados),
  /** Vínculo aluno/conteúdo/motivo de cada simulado já gerado pela IA — pra juntar com a lista de aprovação por simuladoId. */
  listarSimuladosGerados: () => api.get<SimuladoGeradoIAResponse[]>('/ia/geracao/simulado'),
  recomendacoesPorAluno: (alunoId: number) =>
    api.get<Recomendacao[]>(`/ia/recomendacoes/aluno/${alunoId}`),
  revisoesPorAluno: (alunoId: number) =>
    api.get<RevisaoConteudoResponse[]>(`/ia/revisao-conteudo/aluno/${alunoId}`),
}
