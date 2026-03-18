import type { HTMLAttributes } from 'react'

export interface TabOption {
  label: string
  value: string
}

export interface TabProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: TabOption[]
  value?: string
  onChange?: (value: string) => void
}