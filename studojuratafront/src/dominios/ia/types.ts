import type { NivelDificuldade } from '@/dominios/simulados/types'

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
  nivelPrioritario?: NivelDificuldade
  dataProximoReforco?: string
}

export interface GerarSimuladoIARequest {
  alunoId: number
  conteudoPlanoId: number
  nivelDificuldade?: NivelDificuldade
  motivos?: MotivoRecomendacao[]
}

export interface SimuladoGeradoIAResponse {
  simuladoId: number
  alunoId: number
  conteudoPlanoId: number
  conteudoTitulo: string
  motivos: MotivoRecomendacao[]
  prazoLancamento: string
}
