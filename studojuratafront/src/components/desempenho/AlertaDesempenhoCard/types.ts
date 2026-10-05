import type { ReactNode } from 'react'

export type Tom = 'warning' | 'success'

export interface AlertaDesempenhoCardProps {
  titulo: string
  descricao: string
  acao?: ReactNode
  /** 'warning' (padrão): algo pede atenção. 'success': confirmação de que está dentro do esperado. */
  tom?: Tom
}
