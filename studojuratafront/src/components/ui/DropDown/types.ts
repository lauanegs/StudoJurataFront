import type { HTMLAttributes } from 'react'

export interface DropDownItem {
  label: string
  value: string
}

export interface DropDownProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  grade?: string
  items?: DropDownItem[]
  defaultOpen?: boolean
}