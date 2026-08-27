import { Button as MantineButton } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import { comTamanho } from '../../../utils/redimensionarIcone'
import type { ButtonProps, ButtonSize, ButtonVariant } from './types'

const SIZE_STYLES: Record<ButtonSize, { height: string; paddingInline: string; fontSize: string }> = {
  small: { height: '36px', paddingInline: tokens.spacing.sm, fontSize: tokens.typography.sizes.xs },
  medium: { height: '44px', paddingInline: tokens.spacing.lg, fontSize: tokens.typography.sizes.sm },
  // 56px pra bater com a altura dos campos (Input/Select/DatePicker), quando um
  // botão de ação divide linha com eles no header — confirmado no Figma.
  large: { height: '56px', paddingInline: tokens.spacing.xl, fontSize: tokens.typography.sizes.md },
}

// 1.15em em cima do font-size de cada tamanho (confirmado no Figma).
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
  // Confirmado no Figma (Sair/Confirmar resposta/Próxima do simulado):
  // degradê azul — mesma família de cor que theme.colors.blue/blueDark.
  info: { from: '#049DBF', to: '#037E99', border: '#049DBF' },
}

/**
 * Mesma API de sempre (variant/size/icon/loading/fullWidth) — por baixo,
 * delega pro Button da Mantine. Trocar a implementação não obriga a mexer
 * em nenhuma das telas que já usam <Button>.
 */
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

  return (
    <MantineButton
      type={type}
      variant={gradient ? 'gradient' : variant === 'secondary' ? 'outline' : 'subtle'}
      gradient={gradient ? { from: gradient.from, to: gradient.to, deg: 180 } : undefined}
      // Confirmado no Figma: botão discreto de ação de linha (Detalhar,
      // Registrar aula na tabela...) segue o cinza/azul neutro no hover —
      // o roxo de marca fica reservado pra ação secundária/de destaque.
      color={variant === 'secondary' ? 'brandPurple' : variant === 'subtle' ? 'brandNeutral' : undefined}
      leftSection={comTamanho(icon, ICON_SIZES[size])}
      rightSection={comTamanho(iconRight, ICON_SIZES[size])}
      loading={loading}
      fullWidth={fullWidth}
      disabled={disabled}
      radius="md"
      styles={{
        root: {
          ...SIZE_STYLES[size],
          fontWeight: tokens.typography.weights.medium,
          // Desabilitado nunca tem borda: com a borda de 2px, um botão gradient
          // desligado ficava parecendo campo de formulário (input/select), em
          // vez de um botão que simplesmente não pode ser clicado agora.
          border: gradient && !disabled && !noBorder ? `2px solid ${gradient.border}` : undefined,
        },
      }}
      {...rest}
    >
      {content}
    </MantineButton>
  )
}
