import type { ReactNode } from 'react'

export interface ItemDropDown {
  label: string
  value: ReactNode
}

export interface DropDownProps {
  titulo: string
  resumo?: ReactNode
  itens?: ItemDropDown[]
  children?: ReactNode
  abertoInicialmente?: boolean
  emptyText?: string
}
