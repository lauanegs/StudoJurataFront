import type { ReactNode } from 'react'

export type Tom = 'purple' | 'blue' | 'success' | 'orange'

export interface InfoCardProps {
  value: ReactNode
  label: string
  icon?: ReactNode
  tom?: Tom
}
