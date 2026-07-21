export type StatusQuestaoProgresso = 'correta' | 'incorreta' | 'atual' | 'pendente'

export interface ProgressoSimuladoCardProps {
  total: number
  atual: number
  status: StatusQuestaoProgresso[]
}
