import styled, { css } from 'styled-components'
import type { LetterState } from '@/components/simulados/LetterBadge/types'

export const Container = styled.button<{ $state: LetterState; $blocked: boolean }>`
  display: flex;
  align-items: stretch;

  width: 100%;
  min-height: 60px;

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid rgba(115, 115, 115, 0.15);
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
    css`
      border: 3px solid ${theme.colors.blue};
    `}

  ${({ $blocked }) =>
    $blocked &&
    css`
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

  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.blue};
  text-align: center;
  overflow-wrap: anywhere;
`
