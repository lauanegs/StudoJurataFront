import type { HTMLAttributes, ReactNode } from 'react'

export interface SeparadorCardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  icon?: ReactNode
  children?: ReactNode
}