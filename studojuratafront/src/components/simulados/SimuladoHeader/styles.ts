import styled, { css, keyframes } from 'styled-components'

export const pulsar = keyframes`
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
`

export const Container = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};

  background: ${({ theme }) => theme.colors.white};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.xs};
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};

    button {
      height: 40px !important;
    }
  }
`

export const Esquerda = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  min-width: 0;
  flex: 1;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex: 1 1 100%;
  }
`

export const Logo = styled.img`
  width: 44px;
  height: 44px;
  object-fit: contain;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 32px;
    height: 32px;
  }
`

export const Titulo = styled.strong`
  font-size: 24px;
  letter-spacing: -1.2px;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.typography.sizes.md};
    letter-spacing: 0;
  }
`

export const Direita = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex: 1 1 100%;
    gap: ${({ theme }) => theme.spacing.xs};

    & > * {
      flex: 1 1 0;
    }
  }
`

export const Cronometro = styled.div<{ $alerta: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  height: 56px;
  padding: 0 ${({ theme }) => theme.spacing.xl};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 40px;
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme, $alerta }) => ($alerta ? theme.colors.error : theme.colors.borderSoft)};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  font-variant-numeric: tabular-nums;

  background: ${({ theme, $alerta }) => ($alerta ? theme.colors.errorBackground : theme.colors.white)};
  color: ${({ theme, $alerta }) => ($alerta ? theme.colors.errorText : theme.colors.textSecondary)};

  ${({ $alerta }) =>
    $alerta &&
    css`
      animation: ${pulsar} 1.2s ease-in-out infinite;
    `}

  svg {
    width: 16px;
    height: 16px;
  }
`
