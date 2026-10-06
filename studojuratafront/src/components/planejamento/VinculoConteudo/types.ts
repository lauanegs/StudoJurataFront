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
