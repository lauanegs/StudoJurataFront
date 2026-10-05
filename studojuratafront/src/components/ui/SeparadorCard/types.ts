import type { ReactNode } from 'react'
export interface SeparadorCardProps {
  titulo: string
  icon?: ReactNode
  children: ReactNode
  /** Quantos cartões cabem lado a lado, preenchendo a largura. O excedente vira uma próxima página. */
  colunas: number
}
