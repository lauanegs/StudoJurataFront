export type QuestionProgressStatus = 'correct' | 'incorrect' | 'current' | 'answered' | 'pending'

export interface ProgressoSimuladoCardProps {
  current: number
  total: number
  status: QuestionProgressStatus[]
  /** Quando informado, cada segmento vira um atalho para a questão. */
  onGoTo?: (indice: number) => void
  /** Some com a legenda durante a prova (só faz sentido na revisão). */
  showLegend?: boolean
}
