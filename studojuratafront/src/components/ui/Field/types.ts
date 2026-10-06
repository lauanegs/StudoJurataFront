import type { ReactNode } from 'react'

export interface FieldProps {
  label?: string
  htmlFor?: string
  required?: boolean
  hint?: string
  error?: string
  counter?: string
  children: ReactNode
}
