import styled from 'styled-components'
export const PreenchidoDetalhe = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`

export const CabecalhoDetalhe = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

export const TituloDetalhe = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`
