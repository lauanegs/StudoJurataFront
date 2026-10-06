export interface SimuladoIniciarCardProps {
  disciplina: string
  autor?: string
  quantidadeQuestoes?: number | null
  indisponivel?: boolean
  motivoIndisponivel?: string
  loading?: boolean
  onStart?: () => void
}
