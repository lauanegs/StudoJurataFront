import type { EstadoBotaoVF } from './types'
import styled, { css } from 'styled-components'

/**
 * Dois botões (V e F) em vez de uma letra, porque cada afirmação é julgada à
 * parte. Cada peça é uma caixa própria, não fundida como o badge de letra.
 */
export const Container = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
  min-height: 60px;
`

// Largura fixa igual à do LetterBadge.
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

// Mesma caixa do AlternativaCard (borda 2px, raio, texto simples) — só que
// sem a letra fundida à esquerda, já que aqui ela virou os dois botões ao lado.
export const CardTexto = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  padding: 0 ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 2px solid rgba(115, 115, 115, 0.15);
  border-radius: ${({ theme }) => theme.radius.md};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`
