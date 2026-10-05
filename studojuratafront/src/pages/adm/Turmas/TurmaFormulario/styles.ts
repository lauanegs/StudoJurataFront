import styled from 'styled-components'

/* Ações ao lado de campos usam size="large" para ter a mesma altura. A busca
   vem por último (extrema direita), como no Header. */
export const LinhaAcaoFlutuante = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

export { LinhaCampos } from '@/components/ui/LinhaCampos'
