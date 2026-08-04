import styled, { css } from 'styled-components'

import type { LetterState } from './types'

const sizes = {
  small: css`
    width: 28px;
    height: 28px;
    font-size: ${({ theme }) => theme.typography.sizes.xs};
  `,
  medium: css`
    width: 36px;
    height: 36px;
    font-size: ${({ theme }) => theme.typography.sizes.sm};
  `,
  large: css`
    width: 48px;
    height: 48px;
    font-size: ${({ theme }) => theme.typography.sizes.lg};
  `,
}

export const Container = styled.span<{ $state: LetterState; $size: 'small' | 'medium' | 'large' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  border-radius: ${({ theme }) => theme.radius.circle};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.white};

  ${({ $size }) => sizes[$size]}

  box-shadow: ${({ theme }) => theme.shadow.base};

  ${({ theme, $state }) =>
    ({
      default: css`
        background: ${theme.gradients.sidebar};
      `,
      selected: css`
        background: ${theme.gradients.sidebar};
      `,
      correct: css`
        background: ${theme.colors.success};
      `,
      incorrect: css`
        background: ${theme.colors.error};
      `,
    })[$state]}
`
