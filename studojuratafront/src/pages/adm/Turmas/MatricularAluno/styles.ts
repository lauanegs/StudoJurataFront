import styled from 'styled-components'

export const Aviso = styled.p`
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.warningBackground};
  border-radius: ${({ theme }) => theme.radius.md};

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.warningText};
`

export const LinhaRodape = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};
`

export const ListaResponsaveis = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`
