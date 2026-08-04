import type { ReactNode } from 'react'

export interface LayoutProps {
  children: ReactNode
  /** Largura máxima do conteúdo. `larga` remove o limite de 1280px. */
  largura?: 'default' | 'wide'
}
