import { api } from '@/dominios/comum/api'
import type {
  GerarSimuladoIARequest,
  Recomendacao,
  RevisaoConteudoResponse,
  SimuladoGeradoIAResponse,
} from './types'
import type { SimuladoResponse } from '@/dominios/simulados/types'

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
