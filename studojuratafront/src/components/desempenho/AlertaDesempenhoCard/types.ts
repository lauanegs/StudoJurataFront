import type { ReactNode } from 'react'

export type Tom = 'warning' | 'success'

export interface AlertaDesempenhoCardProps {
  titulo: string
  descricao: string
  acao?: ReactNode
  tom?: Tom
}
