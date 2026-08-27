import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'danger' | 'success' | 'info'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children?: ReactNode
  label?: string
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
  loading?: boolean
  fullWidth?: boolean
  /** Confirmado no Figma (rodapé do simulado): botão sem a borda de destaque
   * que os gradientes têm por padrão — usar só quando o card ao redor já
   * fornece contraste suficiente. */
  noBorder?: boolean
}
