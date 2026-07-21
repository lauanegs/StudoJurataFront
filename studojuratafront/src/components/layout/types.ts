import type { ReactNode } from 'react'

export type Perfil = 'adm' | 'professor' | 'aluno'

export interface LayoutProps {
  children: ReactNode
  perfil?: Perfil
}
