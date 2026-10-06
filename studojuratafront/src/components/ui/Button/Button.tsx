import { Button as MantineButton } from '@mantine/core'

import { comTamanho } from '@/utils/redimensionarIcone'
import { estilosBotao, FUNDOS, GRADIENTS } from './styles'
import type { ButtonProps, ButtonSize } from './types'

const ICON_SIZES: Record<ButtonSize, number> = { small: 14, medium: 16, large: 18 }

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
      variant={fundo ? 'filled' : gradient ? 'gradient' : variant === 'secondary' ? 'default' : 'subtle'}
      gradient={gradient ? { from: gradient.from, to: gradient.to, deg: 180 } : undefined}
      color={variant === 'subtle' ? 'brandNeutral' : undefined}
      leftSection={comTamanho(icon, ICON_SIZES[size])}
      rightSection={comTamanho(iconRight, ICON_SIZES[size])}
      loading={loading}
      fullWidth={fullWidth}
      disabled={disabled}
      radius="md"
      styles={estilosBotao({ size, variant, fundo, corDaBorda, noBorder, disabled })}
      {...rest}
    >
      {content}
    </MantineButton>
  )
}
