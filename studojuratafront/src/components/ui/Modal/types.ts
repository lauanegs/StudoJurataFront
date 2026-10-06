import type { ReactNode } from 'react'

export interface ModalProps {
  aberto: boolean
  onClose: () => void
  titulo: string
  descricao?: string
  children: ReactNode
  rodape?: ReactNode
  largura?: string
  bloqueado?: boolean
}
