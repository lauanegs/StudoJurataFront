import type { ReactNode } from 'react'

export type TagVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'purple'

export interface TagProps {
  children: ReactNode
  variant?: TagVariant
  icon?: ReactNode
  ponto?: boolean
  size?: 'small' | 'medium'
}
