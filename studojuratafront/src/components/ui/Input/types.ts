import type { InputHTMLAttributes, ReactNode } from 'react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  required?: boolean
  hint?: string
  error?: string
  icon?: ReactNode
  iconRight?: ReactNode
  onClear?: () => void
  mask?: (value: string) => string
  maxWidth?: string
  corDestaque?: string
  altura?: string
  bordaSolida?: boolean
  alternarVisibilidade?: boolean
  mostrarContador?: boolean
}

export interface OpcoesEstiloCampo {
  altura: string
  corBase: string
  temErro: boolean
  destacada: boolean
}
