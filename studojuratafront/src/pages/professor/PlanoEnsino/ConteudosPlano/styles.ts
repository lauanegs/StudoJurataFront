import styled from 'styled-components'
import { CamposFiltro } from '@/components/ui/Header'

/* flex-shrink:0 nos botões para o texto não cortar quando a linha aperta. */
export const CamposCabecalho = styled(CamposFiltro)`
  > button {
    flex-shrink: 0;
  }
`
