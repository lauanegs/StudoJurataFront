import type { ReactNode } from 'react'

export interface TabOption<V extends string = string> {
  value: V
  label: string
  contador?: number
  icon?: ReactNode
  disabled?: boolean
}

export interface TabProps<V extends string = string> {
  options: TabOption<V>[]
  value: V
  onChange: (value: V) => void
  rotuloAcessivel?: string
}
