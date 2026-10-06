import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.xxl} ${({ theme }) => theme.spacing.lg};
  text-align: center;
`

export const Icone = styled.div<{ $erro?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 64px;
  height: 64px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme, $erro }) => ($erro ? theme.colors.errorBackground : theme.colors.background)};
  color: ${({ theme, $erro }) => ($erro ? theme.colors.error : theme.colors.textTertiary)};

  svg {
    width: 28px;
    height: 28px;
  }
`

export const Titulo = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

export const Descricao = styled.p<{ $larguraMaxima: string }>`
  max-width: ${({ $larguraMaxima }) => $larguraMaxima};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`
