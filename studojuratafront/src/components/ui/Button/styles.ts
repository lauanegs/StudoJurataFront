import styled, { css, keyframes } from 'styled-components'

import type { ButtonSize, ButtonVariant } from './types'

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const sizes = {
  small: css`
    height: 36px;
    padding: 0 ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    gap: ${({ theme }) => theme.spacing.xxs};
  `,
  medium: css`
    height: 44px;
    padding: 0 ${({ theme }) => theme.spacing.lg};
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    gap: ${({ theme }) => theme.spacing.xs};
  `,
  large: css`
    height: 52px;
    padding: 0 ${({ theme }) => theme.spacing.xl};
    font-size: ${({ theme }) => theme.typography.sizes.md};
    gap: ${({ theme }) => theme.spacing.xs};
  `,
} satisfies Record<ButtonSize, ReturnType<typeof css>>

const variants = {
  primary: css`
    background: ${({ theme }) => theme.gradients.primary};
    border: 2px solid ${({ theme }) => theme.colors.buttonPurple};
    color: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadow.base};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.gradients.primaryHover};
      border-color: ${({ theme }) => theme.colors.buttonPurpleDark};
    }
  `,
  secondary: css`
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.purple};
    border: 2px solid ${({ theme }) => theme.colors.purple};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.purpleSoft};
    }
  `,
  subtle: css`
    background: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.purple};
    }
  `,
  danger: css`
    background: ${({ theme }) => theme.gradients.danger};
    color: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadow.base};

    &:hover:not(:disabled) {
      filter: brightness(0.92);
    }
  `,
  success: css`
    background: ${({ theme }) => theme.gradients.success};
    color: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadow.base};

    &:hover:not(:disabled) {
      filter: brightness(0.92);
    }
  `,
} satisfies Record<ButtonVariant, ReturnType<typeof css>>

export const Container = styled.button<{
  $variant: ButtonVariant
  $size: ButtonSize
  $fullWidth: boolean
  $loading: boolean
}>`
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: ${({ theme }) => theme.radius.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  line-height: 1;
  white-space: nowrap;

  transition:
    background ${({ theme }) => theme.transition.base},
    box-shadow ${({ theme }) => theme.transition.base},
    filter ${({ theme }) => theme.transition.base},
    transform ${({ theme }) => theme.transition.fast};

  ${({ $size }) => sizes[$size]}
  ${({ $variant }) => variants[$variant]}

  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  &:disabled {
    opacity: 0.5;
    box-shadow: none;
    filter: grayscale(0.2);
  }

  ${({ $loading }) =>
    $loading &&
    css`
      color: transparent;
      pointer-events: none;
    `}
`

export const Content = styled.span<{ $hidden: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: inherit;
  visibility: ${({ $hidden }) => ($hidden ? 'hidden' : 'visible')};
`

export const Spinner = styled.span`
  position: absolute;
  inset: 0;
  margin: auto;

  width: 18px;
  height: 18px;

  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: ${({ theme }) => theme.radius.circle};

  color: inherit;
  animation: ${spin} 700ms linear infinite;
`

export const Icon = styled.span`
  display: inline-flex;
  align-items: center;

  svg {
    width: 1.15em;
    height: 1.15em;
  }
`
