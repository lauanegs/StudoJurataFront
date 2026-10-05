import type { ReactNode } from 'react'

export interface RodapeDosPassosProps {
  /** Ausente no primeiro passo. */
  aoVoltar?: () => void
  aoAvancar: () => void
  rotuloAvancar: string
  iconeAvancar?: ReactNode
  carregando?: boolean
}
