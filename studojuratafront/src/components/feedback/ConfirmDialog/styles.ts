import styled from 'styled-components'

export const Corpo = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};

  padding-bottom: ${({ theme }) => theme.spacing.xs};
`

export const Icone = styled.div<{ $perigo: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 44px;
  height: 44px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme, $perigo }) => ($perigo ? theme.colors.errorBackground : theme.colors.infoBackground)};
  color: ${({ theme, $perigo }) => ($perigo ? theme.colors.error : theme.colors.blue)};

  svg {
    width: 20px;
    height: 20px;
  }
`

export const Descricao = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`
