import styled from 'styled-components'

import type { LetterState } from './types'

export const Container = styled.span<{ $state: LetterState }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: stretch;
  min-width: 72px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    min-width: 48px;
    padding: 0 ${({ theme }) => theme.spacing.xs};
    font-size: ${({ theme }) => theme.typography.sizes.md};
  }

  padding: 0 ${({ theme }) => theme.spacing.lg};

  border-radius: ${({ theme }) => theme.radius.md} 0 0 ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.badge};

  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  letter-spacing: -0.9px;
  color: ${({ theme }) => theme.colors.white};

  background: ${({ theme, $state }) =>
    ({
      default: theme.gradients.sidebar,
      selected: theme.gradients.sidebar,
      correct: theme.gradients.success,
      incorrect: theme.gradients.danger,
    })[$state]};
`
