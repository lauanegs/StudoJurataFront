import type { ReactNode } from 'react'

export interface HeaderProps {
  titulo: string
  subtitulo?: ReactNode
  voltarPara?: string
  rotuloVoltar?: string
  filtros?: ReactNode
  /** Botões da tela. Ordem visual: secundários à esquerda, primário à direita. */
  actions?: ReactNode
  children?: ReactNode
}

export interface SubtituloItemProps {
  icon: ReactNode
  children: ReactNode
}
