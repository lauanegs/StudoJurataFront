import styled, { css } from 'styled-components'

import { LetterBadge } from '../LetterBadge'
import type { LetterState } from '../LetterBadge/types'

const Container = styled.button<{ $state: LetterState; $blocked: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid rgba(115, 115, 115, 0.15);
  border-radius: ${({ theme }) => theme.radius.md};

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

  ${({ $state, theme }) =>
    $state === 'correct' &&
    css`
      border-color: ${theme.colors.success};
      background: ${theme.colors.successBackground};
    `}

  ${({ $state, theme }) =>
    $state === 'incorrect' &&
    css`
      border-color: ${theme.colors.error};
      background: ${theme.colors.errorBackground};
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

const Texto = styled.span`
  flex: 1;
  min-width: 0;

  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.blue};
  overflow-wrap: anywhere;
`

interface AlternativaButtonProps {
  letra: string
  texto: string
  state?: LetterState
  onSelect?: () => void
  disabled?: boolean
}

export function AlternativaButton({
  letra,
  texto,
  state = 'default',
  onSelect,
  disabled = false,
}: AlternativaButtonProps) {
  return (
    <Container
      type="button"
      $state={state}
      $blocked={disabled}
      disabled={disabled}
      aria-pressed={state === 'selected'}
      onClick={onSelect}
    >
      <LetterBadge letra={letra} state={state} size="large" />
      <Texto>{texto}</Texto>
    </Container>
  )
}
