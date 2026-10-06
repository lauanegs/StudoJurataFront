export type QuestionProgressStatus = 'correct' | 'incorrect' | 'current' | 'answered' | 'pending'

export interface ProgressoSimuladoCardProps {
  current: number
  total: number
  status: QuestionProgressStatus[]
  onGoTo?: (indice: number) => void
  showLegend?: boolean
}
