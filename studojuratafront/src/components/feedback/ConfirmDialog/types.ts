export interface ConfirmDialogProps {
  aberto: boolean
  titulo: string
  descricao?: string
  rotuloConfirmar?: string
  rotuloCancelar?: string
  tone?: 'danger' | 'default'
  processando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}
