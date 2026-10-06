import type { ReactNode } from 'react'

export interface HeaderProps {
  titulo: string
  subtitulo?: ReactNode
  voltarPara?: string
  rotuloVoltar?: string
  filtros?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}

export interface SubtituloItemProps {
  icon: ReactNode
  children: ReactNode
}
