import styled, { css } from 'styled-components'

export const Container = styled.span<{ $variant: 'neutral' | 'purple' | 'blue'; $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  max-width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};

  border-radius: ${({ theme }) => theme.radius.pill};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};

  ${({ theme, $variant }) =>
    ({
      neutral: css`
        background: rgba(230, 234, 242, 0.6);
        color: ${theme.colors.textTertiary};
      `,
      purple: css`
        background: ${theme.colors.purpleSoft};
        border: 1px solid ${theme.colors.purple};
        color: ${theme.colors.purple};
      `,
      blue: css`
        background: ${theme.colors.infoBackground};
        border: 1px solid ${theme.colors.blue};
        color: ${theme.colors.infoText};
      `,
    })[$variant]}

  opacity: ${({ $disabled }) => ($disabled ? 0.55 : 1)};
`

export const Texto = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const Remover = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;
  border-radius: ${({ theme }) => theme.radius.circle};
  color: inherit;

  transition: background ${({ theme }) => theme.transition.fast};

  &:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.08);
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  svg {
    width: 12px;
    height: 12px;
  }
`
