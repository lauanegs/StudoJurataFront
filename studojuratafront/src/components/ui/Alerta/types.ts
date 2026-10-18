import type { ReactNode } from 'react'

export type TomAlerta = 'success' | 'warning' | 'error' | 'info'

export interface CoresAlerta {
  cor: string
  glifo: string
}

export interface AlertaProps {
  titulo?: string
  descricao: ReactNode
  acao?: ReactNode
  tom?: TomAlerta
}
