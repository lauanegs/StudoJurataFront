import type { ReactNode } from 'react'

export interface ModalProps {
  aberto: boolean
  onClose: () => void
  titulo: string
  descricao?: string
  children: ReactNode
  rodape?: ReactNode
  largura?: string
  /** Impede fechar por Esc / clique no overlay (durante um salvamento). */
  bloqueado?: boolean
}
