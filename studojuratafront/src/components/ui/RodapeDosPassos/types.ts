import type { ReactNode } from 'react'

export interface RodapeDosPassosProps {
  aoVoltar?: () => void
  aoAvancar: () => void
  rotuloAvancar: string
  iconeAvancar?: ReactNode
  carregando?: boolean
}
