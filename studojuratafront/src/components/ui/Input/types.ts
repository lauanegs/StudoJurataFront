import type { InputHTMLAttributes, ReactNode } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  required?: boolean
  hint?: string
  error?: string
  icon?: ReactNode
  iconRight?: ReactNode
  onClear?: () => void
  mask?: (value: string) => string
  maxWidth?: string
}
