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
  /** Cor de destaque da borda/foco. Sobrescreve o roxo padrão — usado na tela de login (azul). */
  corDestaque?: string
  /** Altura mínima do campo. @default '56px' */
  altura?: string
  /** Borda sólida mesmo sem foco (tela de login). O padrão é esmaecida em repouso. */
  bordaSolida?: boolean
  /** Só com `type="password"`: adiciona o botão de mostrar/esconder senha. */
  alternarVisibilidade?: boolean
  /**
   * Exibe o contador "x/maxLength" abaixo do campo quando `maxLength` está
   * definido. `maxLength` continua limitando a digitação mesmo com o
   * contador escondido — só a exibição do número muda.
   * @default true
   */
  mostrarContador?: boolean
}
