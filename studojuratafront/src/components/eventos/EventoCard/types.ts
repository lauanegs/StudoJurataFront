export interface EventoCardProps {
  titulo: string
  dataHorario: string
  descricao?: string
  concluido?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onComplete?: () => void
}
