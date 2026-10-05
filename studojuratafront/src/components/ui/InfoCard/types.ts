import type { ReactNode } from 'react'

export type Tom = 'purple' | 'blue' | 'success' | 'orange'

export interface InfoCardProps {
  value: ReactNode
  label: string
  /** Ícone pra memória visual — ajuda a diferenciar os cards num relance, sem depender só do texto do rótulo. */
  icon?: ReactNode
  /** @default 'purple' */
  tom?: Tom
}
