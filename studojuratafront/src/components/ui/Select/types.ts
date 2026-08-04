import type { ReactNode } from 'react'

export interface SelectOption<V extends string | number = string | number> {
  value: V
  label: string
  description?: string
  disabled?: boolean
  icon?: ReactNode
}

export interface SelectProps<V extends string | number = string | number> {
  options: SelectOption<V>[]
  value: V | null | undefined
  onChange: (value: V | null) => void
  label?: string
  required?: boolean
  hint?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  clearable?: boolean
  searchable?: boolean
  emptyText?: string
  maxWidth?: string
}
