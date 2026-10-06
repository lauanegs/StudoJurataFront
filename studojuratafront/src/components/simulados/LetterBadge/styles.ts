import styled, { css } from 'styled-components'

import type { LetterState } from './types'

export const Container = styled.span<{ $state: LetterState }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: stretch;

  padding: 0 ${({ theme }) => theme.spacing.lg};

  border-radius: ${({ theme }) => theme.radius.md} 0 0 ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.badge};

  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  letter-spacing: -0.9px;
  color: ${({ theme }) => theme.colors.white};

  ${({ theme, $state }) =>
    ({
      default: css`
        background: ${theme.gradients.sidebar};
      `,
      selected: css`
        background: ${theme.gradients.sidebar};
      `,
      correct: css`
        background: ${theme.gradients.success};
      `,
      incorrect: css`
        background: ${theme.gradients.danger};
      `,
    })[$state]}
`
