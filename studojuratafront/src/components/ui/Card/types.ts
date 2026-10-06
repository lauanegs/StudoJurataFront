import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  titulo?: string
  icon?: ReactNode
  actions?: ReactNode
  semPadding?: boolean
  corpoComFundo?: boolean
  elevacao?: 'none' | 'default' | 'medium'
}
