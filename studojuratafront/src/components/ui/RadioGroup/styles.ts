import styled from 'styled-components'

import { theme as tokens } from '@/styles/theme'
import { corComOpacidade } from '@/utils/corComOpacidade'

export const estilosRadio = (temErro: boolean) => ({
  radio: {
    borderWidth: '2px',
    borderColor: temErro
      ? corComOpacidade(tokens.colors.error, 0.5)
      : corComOpacidade(tokens.colors.buttonPurple, 0.35),
  },
})

export const RotuloComDescricao = styled.span`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const Descricao = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textTertiary};
`
