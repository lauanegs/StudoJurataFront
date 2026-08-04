import type { InputHTMLAttributes, ReactNode } from 'react'

export interface CheckBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  description?: string
  error?: string
  /** Estado visual de "parcialmente marcado" (seleção em massa de tabela). */
  indeterminate?: boolean
}
