import styled, { type DefaultTheme } from 'styled-components'

import type { BadgeColor } from './types'

const cores = (theme: DefaultTheme): Record<BadgeColor, string> => ({
  purple: `background: ${theme.gradients.primary}; color: ${theme.colors.white};`,
  green: `background: ${theme.colors.success}; color: ${theme.colors.white};`,
  red: `background: ${theme.colors.error}; color: ${theme.colors.white};`,
  blue: `background: ${theme.colors.blue}; color: ${theme.colors.white};`,
  gray: `background: ${theme.colors.background}; color: ${theme.colors.textSecondary};`,
})

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
      rectangle: `
        min-width: 72px;
        height: 28px;
        padding: 0 ${theme.spacing.sm};
        border-radius: ${theme.radius.sm};
      `,
      square: `
        width: 36px;
        height: 36px;
        border-radius: ${theme.radius.md};
      `,
      circle: `
        width: 36px;
        height: 36px;
        border-radius: ${theme.radius.circle};
      `,
    })[$shape]}

  ${({ $color, theme }) => cores(theme)[$color]}

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
