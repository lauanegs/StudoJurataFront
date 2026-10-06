import type { CSSProperties } from 'react'

import { theme as tokens } from '@/styles/theme'
import { corComOpacidade } from '@/utils/corComOpacidade'

interface OpcoesEstiloCampo {
  altura: string
  corBase: string
  temErro: boolean
  destacada: boolean
}

export const estilosCampo = ({ altura, corBase, temErro, destacada }: OpcoesEstiloCampo) => ({
  input: {
    minHeight: altura,
    borderWidth: '2px',
    borderColor: corComOpacidade(temErro ? tokens.colors.error : corBase, destacada ? 1 : 0.45),
    boxShadow: tokens.shadow.base,
    transition: `border-color ${tokens.transition.base}`,
  },
})

export const estiloLarguraMaxima = (maxWidth: string | undefined, style?: CSSProperties): CSSProperties => ({
  maxWidth,
  ...style,
})
