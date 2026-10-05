import styled from 'styled-components'

/** Linha de campos de um formulário inline (ex.: selects + botão "Vincular"); empilha no tablet. */
export const LinhaCampos = styled.div<{ $colunas: string }>`
  display: grid;
  grid-template-columns: ${({ $colunas }) => $colunas};
  align-items: end;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`
