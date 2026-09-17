import type { NivelDificuldade } from './simulados'

export type NivelDominio = 'BAIXO' | 'MEDIO' | 'ALTO'

export type MotivoRecomendacao = 'REPETICAO_ESPACADA' | 'BAIXO_APROVEITAMENTO'

export interface RevisaoConteudoResponse {
  id: number
  alunoId: number
  conteudoPlanoId: number
  quantidadeReforcos?: number
  dataUltimoReforco?: string
  dataProximoReforco?: string
  nivelDominio?: NivelDominio
}

export interface Recomendacao {
  alunoId: number
  conteudoPlanoId: number
  conteudoTitulo: string
  motivos: MotivoRecomendacao[]
  taxaAcerto?: number
  /** Só presente com motivo BAIXO_APROVEITAMENTO: nível de dificuldade mais fraco do aluno nesse conteúdo — o mesmo nível que a IA usa ao gerar o reforço, salvo escolha manual do professor. */
  nivelPrioritario?: NivelDificuldade
  dataProximoReforco?: string
}

export interface GerarSimuladoIARequest {
  alunoId: number
  conteudoPlanoId: number
  nivelDificuldade?: NivelDificuldade
  /** Motivo(s) da Recomendacao que originou esta chamada, quando houver (ver SimuladoGeradoIAResponse). */
  motivos?: MotivoRecomendacao[]
}

/** Vínculo aluno/conteúdo/motivo de um simulado gerado pela IA — GET /ia/geracao/simulado. */
export interface SimuladoGeradoIAResponse {
  simuladoId: number
  alunoId: number
  conteudoPlanoId: number
  conteudoTitulo: string
  motivos: MotivoRecomendacao[]
  /** Prazo pra revisar/lançar o simulado — passado isso sem lançar (Simulado.status ainda RASCUNHO), conta como atrasado. */
  prazoLancamento: string
}
