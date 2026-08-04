import type { ReactNode } from 'react'

export interface FieldProps {
  /** Rótulo acima do controle. Omitir só em buscas e filtros compactos. */
  label?: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  counter?: string
  children: ReactNode
}
