import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type IconButtonVariant = 'neutral' | 'purple' | 'danger' | 'success'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  acao?: string
  icon: ReactNode
  variant?: IconButtonVariant
  size?: 'small' | 'medium'
}
