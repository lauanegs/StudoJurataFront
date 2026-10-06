import type { ReactNode } from 'react'

export interface LayoutProps {
  children: ReactNode
  largura?: 'default' | 'wide'
}
