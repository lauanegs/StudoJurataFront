export interface EventoCardProps {
  titulo: string
  data: string
  descricao?: string
  concluido?: boolean
  onEdit?: () => void
  onDelete?: () => void
}
