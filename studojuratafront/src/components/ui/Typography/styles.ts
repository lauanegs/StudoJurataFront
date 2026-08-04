import styled, { css } from 'styled-components'

import type { TextTone, TextVariant } from './types'

const variants = {
  pageTitle: css`
    font-size: ${({ theme }) => theme.typography.sizes.title};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  `,
  displayTitle: css`
    font-size: ${({ theme }) => theme.typography.sizes.title};
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  `,
  subtitle: css`
    font-size: ${({ theme }) => theme.typography.sizes.xl};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  `,
  largeNumber: css`
    font-size: ${({ theme }) => theme.typography.sizes.xxl};
    font-weight: ${({ theme }) => theme.typography.weights.bold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  `,
  sectionTitle: css`
    font-size: ${({ theme }) => theme.typography.sizes.md};
    font-weight: ${({ theme }) => theme.typography.weights.semiBold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  `,
  itemTitle: css`
    font-size: ${({ theme }) => theme.typography.sizes.lg};
    font-weight: ${({ theme }) => theme.typography.weights.semiBold};
    line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  `,
  body: css`
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.regular};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  `,
  bodyStrong: css`
    font-size: ${({ theme }) => theme.typography.sizes.sm};
    font-weight: ${({ theme }) => theme.typography.weights.medium};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  `,
  caption: css`
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    font-weight: ${({ theme }) => theme.typography.weights.regular};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  `,
  captionStrong: css`
    font-size: ${({ theme }) => theme.typography.sizes.xs};
    font-weight: ${({ theme }) => theme.typography.weights.semiBold};
    line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  `,
} satisfies Record<TextVariant, ReturnType<typeof css>>

export const Base = styled.span<{
  $variant: TextVariant
  $tone: TextTone
  $align?: 'left' | 'center' | 'right'
  $lines?: number
}>`
  margin: 0;

  ${({ $variant }) => variants[$variant]}

  color: ${({ theme, $tone }) =>
    ({
      strong: theme.colors.textStrong,
      secondary: theme.colors.textSecondary,
      tertiary: theme.colors.textTertiary,
      purple: theme.colors.purple,
      blue: theme.colors.blue,
      success: theme.colors.successText,
      error: theme.colors.errorText,
      warning: theme.colors.warningText,
      white: theme.colors.white,
    })[$tone]};

  ${({ $align }) => $align && css`text-align: ${$align};`}

  ${({ $lines }) =>
    $lines &&
    css`
      display: -webkit-box;
      -webkit-line-clamp: ${$lines};
      -webkit-box-orient: vertical;
      overflow: hidden;
    `}
`
