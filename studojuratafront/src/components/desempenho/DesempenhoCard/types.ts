import type { ReactNode } from 'react'

export interface DesempenhoCardProps {
  titulo: string
  descricao?: ReactNode
  porcentagem: number
  icon?: ReactNode
  orientacao?: 'vertical' | 'horizontal'
  onClick?: () => void
}
