import styled, { css } from 'styled-components'

import type { IconButtonVariant } from './types'

const variants = {
  neutral: css`
    color: ${({ theme }) => theme.colors.textSecondary};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.textStrong};
    }
  `,
  purple: css`
    color: ${({ theme }) => theme.colors.purple};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.purpleSoft};
    }
  `,
  danger: css`
    color: ${({ theme }) => theme.colors.error};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.errorBackground};
    }
  `,
  success: css`
    color: ${({ theme }) => theme.colors.successText};
    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.successBackground};
    }
  `,
} satisfies Record<IconButtonVariant, ReturnType<typeof css>>

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

  ${({ $variant }) => variants[$variant]}

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
