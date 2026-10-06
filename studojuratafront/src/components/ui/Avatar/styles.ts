import { theme as tokens } from '@/styles/theme'
import type { AvatarProps } from './types'

type TamanhoAvatar = NonNullable<AvatarProps['size']>

export const TAMANHOS: Record<TamanhoAvatar, string> = {
  small: '32px',
  medium: '44px',
  large: '72px',
  extraLarge: '120px',
}

const FONTES: Record<TamanhoAvatar, string> = {
  small: '12px',
  medium: '14px',
  large: '22px',
  extraLarge: '36px',
}

export const estilosAvatar = (size: TamanhoAvatar, destaque?: boolean) => ({
  root: {
    boxShadow: destaque ? `0 0 0 3px ${tokens.colors.white}, 0 0 0 6px ${tokens.colors.warning}` : undefined,
  },
  placeholder: {
    background: tokens.gradients.primary,
    color: tokens.colors.white,
    fontSize: FONTES[size],
    fontWeight: 600,
    letterSpacing: '0.5px',
  },
})
