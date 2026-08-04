import styled, { css } from 'styled-components'

import type { TagVariant } from './types'

export const Container = styled.span<{ $variant: TagVariant; $size: 'small' | 'medium' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  padding: ${({ $size }) => ($size === 'small' ? '2px 8px' : '4px 12px')};
  border-radius: ${({ theme }) => theme.radius.sm};

  font-size: ${({ theme, $size }) =>
    $size === 'small' ? '11px' : theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
  white-space: nowrap;

  ${({ theme, $variant }) =>
    ({
      success: css`
        background: ${theme.colors.successBackground};
        color: ${theme.colors.successText};
      `,
      error: css`
        background: ${theme.colors.errorBackground};
        color: ${theme.colors.errorText};
      `,
      warning: css`
        background: ${theme.colors.warningBackground};
        color: ${theme.colors.warningText};
      `,
      info: css`
        background: ${theme.colors.infoBackground};
        color: ${theme.colors.infoText};
      `,
      neutral: css`
        background: ${theme.colors.background};
        color: ${theme.colors.textSecondary};
      `,
      purple: css`
        background: ${theme.colors.purpleSoft};
        color: ${theme.colors.purple};
      `,
    })[$variant]}

  svg {
    width: 12px;
    height: 12px;
  }
`

export const Ponto = styled.span`
  width: 6px;
  height: 6px;
  border-radius: ${({ theme }) => theme.radius.circle};
  background: currentColor;
`
