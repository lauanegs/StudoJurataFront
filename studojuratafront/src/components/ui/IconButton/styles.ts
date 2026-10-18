import styled, { type DefaultTheme } from 'styled-components'

import type { IconButtonVariant } from './types'

const variantes = (theme: DefaultTheme): Record<IconButtonVariant, string> => ({
  neutral: `
    color: ${theme.colors.textSecondary};
    &:hover:not(:disabled) {
      background: ${theme.colors.background};
      color: ${theme.colors.textStrong};
    }
  `,
  purple: `
    color: ${theme.colors.purple};
    &:hover:not(:disabled) {
      background: ${theme.colors.purpleSoft};
    }
  `,
  danger: `
    color: ${theme.colors.error};
    &:hover:not(:disabled) {
      background: ${theme.colors.errorBackground};
    }
  `,
  success: `
    color: ${theme.colors.successText};
    &:hover:not(:disabled) {
      background: ${theme.colors.successBackground};
    }
  `,
})

export const Container = styled.button<{
  $variant: IconButtonVariant
  $size: 'small' | 'medium'
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: ${({ $size }) => ($size === 'small' ? '28px' : '36px')};
  height: ${({ $size }) => ($size === 'small' ? '28px' : '36px')};

  border-radius: ${({ theme }) => theme.radius.md};
  background: transparent;

  transition:
    background ${({ theme }) => theme.transition.base},
    color ${({ theme }) => theme.transition.base};

  ${({ $variant, theme }) => variantes(theme)[$variant]}

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  &:disabled {
    opacity: 0.4;
  }

  svg {
    width: ${({ $size }) => ($size === 'small' ? '16px' : '18px')};
    height: ${({ $size }) => ($size === 'small' ? '16px' : '18px')};
  }
`
