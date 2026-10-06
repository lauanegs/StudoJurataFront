import styled from 'styled-components'

export const Container = styled.article`
  display: flex;
  align-items: center;
  flex: 1 0 0;
  gap: ${({ theme }) => theme.spacing.md};

  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.base};
`

export const Icone = styled.div<{ $bg: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 48px;
  height: 48px;

  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ $bg }) => $bg};
  color: ${({ theme }) => theme.colors.white};
`

export const Textos = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 0;
`

export const Valor = styled.strong`
  font-size: 28px;
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  letter-spacing: -0.5px;
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-variant-numeric: tabular-nums;
`

export const Selo = styled.span`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textTertiary};
`
