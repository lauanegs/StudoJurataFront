import { Avatar as MantineAvatar } from '@mantine/core'

import { iniciais } from '@/utils/format'
import { estilosAvatar, TAMANHOS } from './styles'
import type { AvatarProps } from './types'

export function Avatar({ nome, src, size = 'medium', destaque }: AvatarProps) {
  return (
    <MantineAvatar
      src={src}
      alt={nome ? `Foto de ${nome}` : 'Foto de perfil'}
      title={nome ?? undefined}
      size={TAMANHOS[size]}
      radius={999}
      styles={estilosAvatar(size, destaque)}
    >
      {iniciais(nome)}
    </MantineAvatar>
  )
}
