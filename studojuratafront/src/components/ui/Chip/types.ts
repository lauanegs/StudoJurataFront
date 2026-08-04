import type { ReactNode } from 'react'

export interface ChipProps {
  children: ReactNode
  icon?: ReactNode
  /** Quando informado, mostra o "x" de remover (chips de vínculo). */
  onRemove?: () => void
  rotuloRemover?: string
  variant?: 'neutral' | 'purple' | 'blue'
  disabled?: boolean
}
