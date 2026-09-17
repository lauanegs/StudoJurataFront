import { Button as MantineButton } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import { comTamanho } from '../../../utils/redimensionarIcone'
import type { ButtonProps, ButtonSize, ButtonVariant } from './types'

const SIZE_STYLES: Record<ButtonSize, { height: string; paddingInline: string; fontSize: string }> = {
  small: { height: '36px', paddingInline: tokens.spacing.sm, fontSize: tokens.typography.sizes.xs },
  medium: { height: '44px', paddingInline: tokens.spacing.lg, fontSize: tokens.typography.sizes.sm },
  // 56px para bater com a altura dos campos quando o botão divide linha com eles.
  large: { height: '56px', paddingInline: tokens.spacing.xl, fontSize: tokens.typography.sizes.md },
}

// 1.15em sobre o font-size de cada tamanho.
const ICON_SIZES: Record<ButtonSize, number> = { small: 14, medium: 16, large: 18 }

const GRADIENTS: Partial<Record<ButtonVariant, { from: string; to: string; border: string }>> = {
  primary: {
    from: tokens.colors.buttonPurple,
    to: tokens.colors.buttonPurpleLight,
    border: tokens.colors.buttonPurple,
  },
  danger: { from: '#DB5461', to: '#CF505C', border: '#DB5461' },
  // Mesmo verde dos cards de desempenho do módulo de Reforço (theme.colors.success).
  success: { from: '#3DCB63', to: '#34C759', border: '#34C759' },
}

// Fundos que não são degradê de 2 cores usam o `background` literal do token,
// já que o `gradient` da Mantine só aceita from/to ("info" é igual ao fundo da Sidebar).
const FUNDOS: Partial<Record<ButtonVariant, { background: string; border: string }>> = {
  info: { background: tokens.gradients.sidebar, border: tokens.colors.blue },
}

export function Button({
  children,
  label,
  variant = 'primary',
  size = 'medium',
  icon,
  iconRight,
  loading = false,
  fullWidth = false,
  disabled,
  type = 'button',
  noBorder = false,
  ...rest
}: ButtonProps) {
  const content = children ?? label
  const gradient = GRADIENTS[variant]
  const fundo = FUNDOS[variant]
  const corDaBorda = gradient?.border ?? fundo?.border

  return (
    <MantineButton
      type={type}
      // "default" + contorno cinza (styles.root): uma borda roxa grossa se
      // confundiria com os campos de formulário.
      variant={fundo ? 'filled' : gradient ? 'gradient' : variant === 'secondary' ? 'default' : 'subtle'}
      gradient={gradient ? { from: gradient.from, to: gradient.to, deg: 180 } : undefined}
      // Ação de linha de tabela: hover neutro, o roxo fica para ações de destaque.
      color={variant === 'subtle' ? 'brandNeutral' : undefined}
      leftSection={comTamanho(icon, ICON_SIZES[size])}
      rightSection={comTamanho(iconRight, ICON_SIZES[size])}
      loading={loading}
      fullWidth={fullWidth}
      disabled={disabled}
      radius="md"
      styles={{
        root: {
          ...SIZE_STYLES[size],
          fontWeight: variant === 'secondary' ? tokens.typography.weights.semiBold : tokens.typography.weights.medium,
          background: fundo && !disabled ? fundo.background : undefined,
          // Desabilitado sem borda: com ela, parecia um campo de formulário.
          border: corDaBorda && !disabled && !noBorder ? `2px solid ${corDaBorda}` : undefined,
          // Contorno cinza (não roxo, para não colidir com os campos) + texto roxo em negrito.
          ...(variant === 'secondary' && !disabled
            ? {
                // Sem sombra: um botão de contorno já lê bem só com a borda.
                border: `2px solid ${tokens.colors.borderStrong}`,
                color: tokens.colors.purpleDark,
              }
            : null),
        },
      }}
      {...rest}
    >
      {content}
    </MantineButton>
  )
}
