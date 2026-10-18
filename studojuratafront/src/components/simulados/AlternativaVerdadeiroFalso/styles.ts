import type { EstadoBotaoVF } from './types'
import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
  min-height: 60px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`

export const BotaoJulgamento = styled.button<{ $estado: EstadoBotaoVF; $blocked: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 64px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex: 1 1 0;
    width: auto;
    min-height: 52px;
  }

  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  transition:
    background ${({ theme }) => theme.transition.base},
    border-color ${({ theme }) => theme.transition.base};

  ${({ theme, $estado }) =>
    ({
      default: `
        background: ${theme.colors.white};
        border: 2px solid ${theme.colors.blueLight};
        color: ${theme.colors.blue};
      `,
      selected: `
        background: ${theme.colors.blue};
        border: 2px solid ${theme.colors.blue};
        color: ${theme.colors.white};
      `,
      correct: `
        background: ${theme.gradients.success};
        border: 2px solid transparent;
        color: ${theme.colors.white};
      `,
      incorrect: `
        background: ${theme.gradients.danger};
        border: 2px solid transparent;
        color: ${theme.colors.white};
      `,
    })[$estado]}

  ${({ $blocked }) =>
    $blocked &&
    'cursor: default;'}

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

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    order: -1;
    flex: 1 1 100%;
    padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
    min-height: 56px;
  }
`
