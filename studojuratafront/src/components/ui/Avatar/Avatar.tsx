import { useState } from 'react'

import { iniciais } from '../../../utils/format'
import * as S from './styles'
import type { AvatarProps } from './types'

/** Foto do usuário com fallback para as iniciais do nome. */
export function Avatar({ nome, src, size = 'medium', destaque }: AvatarProps) {
  const [falhou, setFalhou] = useState(false)
  const mostrarImagem = Boolean(src) && !falhou

  return (
    <S.Container $size={size} $destaque={destaque} title={nome ?? undefined}>
      {mostrarImagem ? (
        <S.Imagem src={src as string} alt={nome ? `Foto de ${nome}` : 'Foto de perfil'} onError={() => setFalhou(true)} />
      ) : (
        <span aria-hidden="true">{iniciais(nome)}</span>
      )}
    </S.Container>
  )
}
