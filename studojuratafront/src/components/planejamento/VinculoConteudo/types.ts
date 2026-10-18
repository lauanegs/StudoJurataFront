import type { ConteudoPlano } from '@/dominios/planejamento/types'

export interface TextosVinculoConteudo {
  vinculado: string
  removido: string
  semEntidade?: string
  semEscopo: string
  semVinculos: string
  descricaoModal: string
  modalVazio: string
}

export interface ServicoVinculoConteudo {
  listarConteudos: (id: number) => Promise<{ conteudoPlano?: ConteudoPlano }[]>
  vincularConteudo: (id: number, conteudoPlanoId: number) => Promise<unknown>
  desvincularConteudo: (id: number, conteudoPlanoId: number) => Promise<void>
}

export interface VinculoConteudoProps {
  entidadeId?: number
  escopoId?: number | null
  pertenceAoEscopo: (conteudo: ConteudoPlano) => boolean
  servico: ServicoVinculoConteudo
  textos: TextosVinculoConteudo
  exigirEntidade?: boolean
  somenteLeitura?: boolean
  conteudoPlanoIdsPendentes?: number[]
  onChangePendentes?: (ids: number[]) => void
}

export interface VinculoConteudoAulaProps {
  aulaId?: number
  planoEnsinoId?: number | null
  somenteLeitura?: boolean
  conteudoPlanoIdsPendentes?: number[]
  onChangePendentes?: (ids: number[]) => void
  permitirModoLocal?: boolean
}

export interface VinculoConteudoQuestaoProps {
  questaoId?: number
  disciplinaId?: number | null
  somenteLeitura?: boolean
  conteudoPlanoIdsPendentes?: number[]
  onChangePendentes?: (ids: number[]) => void
}
