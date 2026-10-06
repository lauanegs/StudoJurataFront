import styled from 'styled-components'

export const Setas = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxs};
  flex-shrink: 0;
`

export const Trilha = styled.div<{ $colunas: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $colunas }) => $colunas}, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};

  padding: ${({ theme }) => theme.spacing.xl};
`
