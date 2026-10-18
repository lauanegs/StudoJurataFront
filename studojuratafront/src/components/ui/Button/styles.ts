import { theme as tokens } from '@/styles/theme'
import type { ButtonSize, ButtonVariant, OpcoesEstiloBotao } from './types'

const SIZE_STYLES: Record<ButtonSize, { height: string; paddingInline: string; fontSize: string }> = {
  small: { height: '36px', paddingInline: tokens.spacing.sm, fontSize: tokens.typography.sizes.xs },
  medium: { height: '44px', paddingInline: tokens.spacing.lg, fontSize: tokens.typography.sizes.sm },
  large: { height: '56px', paddingInline: tokens.spacing.xl, fontSize: tokens.typography.sizes.md },
}

export const GRADIENTS: Partial<Record<ButtonVariant, { from: string; to: string; border: string }>> = {
  primary: {
    from: tokens.colors.buttonPurple,
    to: tokens.colors.buttonPurpleLight,
    border: tokens.colors.buttonPurple,
  },
  danger: {
    from: tokens.gradientPairs.danger.from,
    to: tokens.gradientPairs.danger.to,
    border: tokens.gradientPairs.danger.from,
  },
  success: {
    from: tokens.gradientPairs.success.from,
    to: tokens.colors.success,
    border: tokens.colors.success,
  },
}

export const FUNDOS: Partial<Record<ButtonVariant, { background: string; border: string }>> = {
  info: { background: tokens.gradients.sidebar, border: tokens.colors.blue },
}

export const estilosBotao = ({ size, variant, fundo, corDaBorda, noBorder, disabled }: OpcoesEstiloBotao) => ({
  root: {
    ...SIZE_STYLES[size],
    fontWeight: variant === 'secondary' ? tokens.typography.weights.semiBold : tokens.typography.weights.medium,
    background: fundo && !disabled ? fundo.background : undefined,
    border: corDaBorda && !disabled && !noBorder ? `2px solid ${corDaBorda}` : undefined,
    ...(variant === 'secondary' && !disabled
      ? {
          border: `2px solid ${tokens.colors.borderStrong}`,
          color: tokens.colors.purpleDark,
        }
      : null),
  },
})
