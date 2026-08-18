import { Avatar as MantineAvatar } from '@mantine/core'

import { iniciais } from '../../../utils/format'
import { theme as tokens } from '../../../styles/theme'
import type { AvatarProps } from './types'

const TAMANHOS: Record<NonNullable<AvatarProps['size']>, string> = {
  small: '32px',
  medium: '44px',
  large: '72px',
  extraLarge: '120px',
}

const FONTES: Record<NonNullable<AvatarProps['size']>, string> = {
  small: '12px',
  medium: '14px',
  large: '22px',
  extraLarge: '36px',
}

/**
 * Foto do usuário com fallback para as iniciais do nome — a Mantine já troca
 * pro `children` sozinha quando `src` falha ou não existe, sem precisar de
 * um `useState` de erro na mão.
 */
export function Avatar({ nome, src, size = 'medium', destaque }: AvatarProps) {
  return (
    <MantineAvatar
      src={src}
      alt={nome ? `Foto de ${nome}` : 'Foto de perfil'}
      title={nome ?? undefined}
      size={TAMANHOS[size]}
      radius={999}
      styles={{
        root: {
          boxShadow: destaque
            ? `0 0 0 3px ${tokens.colors.white}, 0 0 0 6px ${tokens.colors.warning}`
            : undefined,
        },
        placeholder: {
          background: tokens.gradients.primary,
          color: tokens.colors.white,
          fontSize: FONTES[size],
          fontWeight: 600,
          letterSpacing: '0.5px',
        },
      }}
    >
      {iniciais(nome)}
    </MantineAvatar>
  )
}
