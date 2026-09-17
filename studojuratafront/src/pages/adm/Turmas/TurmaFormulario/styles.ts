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

export const LinhaCampos = styled.div<{ $colunas: string }>`
  display: grid;
  grid-template-columns: ${({ $colunas }) => $colunas};
  align-items: end;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`
