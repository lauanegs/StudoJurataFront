import type { ReactNode } from 'react'

export interface ChipProps {
  children: ReactNode
  icon?: ReactNode
  onRemove?: () => void
  rotuloRemover?: string
  variant?: 'neutral' | 'purple' | 'blue'
  disabled?: boolean
}
