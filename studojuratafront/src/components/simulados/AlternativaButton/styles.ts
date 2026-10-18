import styled from 'styled-components'
import type { LetterState } from '@/components/simulados/LetterBadge/types'

export const Container = styled.button<{ $state: LetterState; $blocked: boolean }>`
  display: flex;
  align-items: stretch;

  width: 100%;
  min-height: 60px;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    min-height: 48px;
  }

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.borderSoft};
  border-radius: ${({ theme }) => theme.radius.md};
  overflow: hidden;

  text-align: left;
  transition:
    border-color ${({ theme }) => theme.transition.base},
    border-width ${({ theme }) => theme.transition.fast},
    transform ${({ theme }) => theme.transition.fast};

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.blueLight};
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }

  ${({ $state, theme }) =>
    $state === 'selected' &&
    `
      border-color: ${theme.colors.blue};
      box-shadow: 0 0 0 2px ${theme.colors.blue};
    `}

  ${({ $blocked }) =>
    $blocked &&
    `
      cursor: default;

      &:hover {
        transform: none;
      }
    `}
`

export const Texto = styled.span`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 0 ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
    font-size: ${({ theme }) => theme.typography.sizes.md};
  }

  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.blue};
  text-align: center;
  overflow-wrap: anywhere;
`
