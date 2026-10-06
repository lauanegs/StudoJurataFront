import type { EstadoBotaoVF } from './types'
import styled, { css } from 'styled-components'

export const Container = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
  min-height: 60px;
`

export const BotaoJulgamento = styled.button<{ $estado: EstadoBotaoVF; $blocked: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 64px;

  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  transition:
    background ${({ theme }) => theme.transition.base},
    border-color ${({ theme }) => theme.transition.base};

  ${({ theme, $estado }) =>
    ({
      default: css`
        background: ${theme.colors.white};
        border: 2px solid ${theme.colors.blueLight};
        color: ${theme.colors.blue};
      `,
      selected: css`
        background: ${theme.colors.blue};
        border: 2px solid ${theme.colors.blue};
        color: ${theme.colors.white};
      `,
      correct: css`
        background: ${theme.gradients.success};
        border: 2px solid transparent;
        color: ${theme.colors.white};
      `,
      incorrect: css`
        background: ${theme.gradients.danger};
        border: 2px solid transparent;
        color: ${theme.colors.white};
      `,
    })[$estado]}

  ${({ $blocked }) =>
    $blocked &&
    css`
      cursor: default;
    `}

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }
`

export const CardTexto = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  padding: 0 ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 2px solid ${({ theme }) => theme.colors.borderSoft};
  border-radius: ${({ theme }) => theme.radius.md};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`
