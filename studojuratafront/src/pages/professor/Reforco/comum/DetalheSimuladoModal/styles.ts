import styled from 'styled-components'

export const ColunaConteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

/* ListaInfo não tem margem própria; cada tela define o espaçamento. */
export const EnvolveContexto = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

export const ListaAlunos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
`

export const LinhaAluno = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ theme }) => theme.colors.background};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`
