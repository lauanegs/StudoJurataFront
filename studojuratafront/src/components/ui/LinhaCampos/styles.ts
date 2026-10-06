import styled from 'styled-components'

export const LinhaCampos = styled.div<{ $colunas: string }>`
  display: grid;
  grid-template-columns: ${({ $colunas }) => $colunas};
  align-items: end;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`
