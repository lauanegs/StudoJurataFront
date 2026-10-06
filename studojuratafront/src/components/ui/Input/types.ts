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
  /** Altura mínima do campo. @default '56px' */
  altura?: string
  bordaSolida?: boolean
  alternarVisibilidade?: boolean
  /**
   * Exibe o contador "x/maxLength" abaixo do campo quando `maxLength` está
   * definido. `maxLength` continua limitando a digitação mesmo com o
   * contador escondido — só a exibição do número muda.
   * @default true
   */
  mostrarContador?: boolean
}
