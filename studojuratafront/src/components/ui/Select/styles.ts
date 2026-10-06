import styled from 'styled-components'

import { theme as tokens } from '@/styles/theme'
import { corComOpacidade } from '@/utils/corComOpacidade'

export const estilosCampo = (temErro: boolean, emFoco: boolean) => ({
  input: {
    height: '56px',
    minHeight: '56px',
    borderWidth: '2px',
    borderColor: corComOpacidade(temErro ? tokens.colors.error : tokens.colors.buttonPurple, emFoco ? 1 : 0.45),
    boxShadow: tokens.shadow.base,
    transition: `border-color ${tokens.transition.base}`,
  },
})

export const Opcao = styled.div`
  flex: 1;
  min-width: 0;
`
