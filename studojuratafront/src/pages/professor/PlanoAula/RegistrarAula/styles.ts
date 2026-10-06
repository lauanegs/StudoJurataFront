import styled from 'styled-components'

export const Resumo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`

export const SemValor = styled.span`
  color: ${({ theme }) => theme.colors.textDisabled};
`

export const ResumoDaChamada = styled.div`
  padding: 16px 24px 0;
`
