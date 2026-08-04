import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  titulo?: string
  icon?: ReactNode
  actions?: ReactNode
  /** Remove o padding interno — útil quando o filho é uma tabela. */
  semPadding?: boolean
  elevacao?: 'none' | 'default' | 'medium'
}
