import styled, { css } from 'styled-components'

export const Moldura = styled.div<{ $erro?: boolean; $disabled?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme, $erro }) => ($erro ? theme.colors.error : theme.colors.buttonPurple)};
  border-radius: ${({ theme }) => theme.radius.md};
  box-shadow: ${({ theme }) => theme.shadow.base};

  transition:
    border-color ${({ theme }) => theme.transition.base},
    box-shadow ${({ theme }) => theme.transition.base};

  &:focus-within {
    box-shadow: ${({ theme, $erro }) => ($erro ? theme.shadow.focusError : theme.shadow.focus)};
  }

  ${({ $disabled, theme }) =>
    $disabled &&
    css`
      background: ${theme.colors.background};
      border-color: rgba(115, 115, 115, 0.15);
      box-shadow: none;
      opacity: 0.75;
    `}
`

export const Controle = styled.textarea<{ $autoAltura?: boolean }>`
  width: 100%;
  min-height: 96px;

  border: none;
  outline: none;
  background: transparent;
  resize: ${({ $autoAltura }) => ($autoAltura ? 'none' : 'vertical')};

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  color: ${({ theme }) => theme.colors.textStrong};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textDisabled};
  }

  &:disabled {
    cursor: not-allowed;
  }
`
