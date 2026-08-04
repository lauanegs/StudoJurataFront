import styled, { css } from 'styled-components'

import type { BadgeColor } from './types'

const colors = {
  purple: css`
    background: ${({ theme }) => theme.gradients.primary};
    color: ${({ theme }) => theme.colors.white};
  `,
  green: css`
    background: ${({ theme }) => theme.colors.success};
    color: ${({ theme }) => theme.colors.white};
  `,
  red: css`
    background: ${({ theme }) => theme.colors.error};
    color: ${({ theme }) => theme.colors.white};
  `,
  blue: css`
    background: ${({ theme }) => theme.colors.blue};
    color: ${({ theme }) => theme.colors.white};
  `,
  gray: css`
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textSecondary};
  `,
} satisfies Record<BadgeColor, ReturnType<typeof css>>

export const Container = styled.button<{
  $color: BadgeColor
  $shape: 'rectangle' | 'square' | 'circle'
  $selected?: boolean
  $clickable: boolean
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  line-height: 1;

  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  transition:
    transform ${({ theme }) => theme.transition.fast},
    box-shadow ${({ theme }) => theme.transition.base};

  ${({ $shape, theme }) =>
    ({
      rectangle: css`
        min-width: 72px;
        height: 28px;
        padding: 0 ${theme.spacing.sm};
        border-radius: ${theme.radius.sm};
      `,
      square: css`
        width: 36px;
        height: 36px;
        border-radius: ${theme.radius.md};
      `,
      circle: css`
        width: 36px;
        height: 36px;
        border-radius: ${theme.radius.circle};
      `,
    })[$shape]}

  ${({ $color }) => colors[$color]}

  ${({ $selected, theme }) =>
    $selected &&
    css`
      box-shadow: 0 0 0 3px ${theme.colors.white}, 0 0 0 5px ${theme.colors.purple};
    `}

  &:hover:not(:disabled) {
    transform: ${({ $clickable }) => ($clickable ? 'translateY(-1px)' : 'none')};
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
