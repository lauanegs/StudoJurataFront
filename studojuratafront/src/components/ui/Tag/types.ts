import type { ReactNode } from 'react'

export type TagVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'purple'

export interface TagProps {
  children: ReactNode
  variant?: TagVariant
  icon?: ReactNode
  size?: 'small' | 'medium' | 'large'
}
