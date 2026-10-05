import styled from 'styled-components'
/* Cada seção do modal é um card próprio, como em DetalheSimuladoModal. */
export const SecaoDetalhe = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`

/* Espaço entre o resumo dos filtros aplicados e o gráfico abaixo dele. */
export const SecaoContexto = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`
