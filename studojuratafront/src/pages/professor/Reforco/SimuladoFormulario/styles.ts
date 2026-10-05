import styled from 'styled-components'

export const ListaAlunos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  max-height: 320px;
  overflow-y: auto;
  padding-bottom: ${({ theme }) => theme.spacing.xs};
`
