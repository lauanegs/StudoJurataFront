import styled from 'styled-components'

import { theme as tokens } from '@/styles/theme'
import { corComOpacidade } from '@/utils/corComOpacidade'
import type { OpcoesEstiloCampo } from './types'

export const estilosCampo = ({ altura, corBase, temErro, destacada }: OpcoesEstiloCampo) => ({
  input: {
    minHeight: altura,
    borderWidth: '2px',
    borderColor: corComOpacidade(temErro ? tokens.colors.error : corBase, destacada ? 1 : 0.45),
    boxShadow: tokens.shadow.base,
    transition: `border-color ${tokens.transition.base}`,
  },
})

export const LarguraMaxima = styled.div<{ $maxWidth?: string }>`
  max-width: ${({ $maxWidth }) => $maxWidth ?? 'none'};
`
