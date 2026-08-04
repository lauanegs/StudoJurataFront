import styled, { css } from 'styled-components'

export const Moldura = styled.div<{ $erro?: boolean; $disabled?: boolean; $maxWidth?: string }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  width: 100%;
  max-width: ${({ $maxWidth }) => $maxWidth ?? 'none'};
  min-height: 56px;
  padding: 0 ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  /* Confirmado no Figma: borda roxa por padrão, não só em hover/foco. */
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
      cursor: not-allowed;
      opacity: 0.75;
    `}
`

export const Controle = styled.input`
  flex: 1;
  min-width: 0;

  border: none;
  outline: none;
  background: transparent;

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textStrong};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textDisabled};
  }

  &:disabled {
    cursor: not-allowed;
  }

  /* Deixa o ícone nativo do date/time invisível — usamos o nosso. */
  &::-webkit-calendar-picker-indicator {
    opacity: 0;
    position: absolute;
    inset: 0;
    width: 100%;
    cursor: pointer;
  }
`

export const Adorno = styled.span<{ $clicavel?: boolean }>`
  display: inline-flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textTertiary};
  cursor: ${({ $clicavel }) => ($clicavel ? 'pointer' : 'default')};

  svg {
    width: 18px;
    height: 18px;
  }
`
