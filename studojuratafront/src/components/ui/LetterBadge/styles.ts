import styled, { css } from 'styled-components'

import type { LetterState } from './types'

/**
 * Confirmado no Figma (nós 1:939-950 execução, 1:996-1002 revisão): a letra
 * não é um badge circular solto — é um bloco retangular fundido à borda
 * esquerda da linha, ocupando a altura inteira (align-self: stretch),
 * arredondado só nos cantos esquerdos.
 */
export const Container = styled.span<{ $state: LetterState }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: stretch;

  padding: 0 ${({ theme }) => theme.spacing.lg};

  border-radius: ${({ theme }) => theme.radius.md} 0 0 ${({ theme }) => theme.radius.md};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);

  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  letter-spacing: -0.9px;
  color: ${({ theme }) => theme.colors.white};

  ${({ theme, $state }) =>
    ({
      default: css`
        background: ${theme.gradients.sidebar};
      `,
      selected: css`
        background: ${theme.gradients.sidebar};
      `,
      correct: css`
        background: ${theme.gradients.success};
      `,
      incorrect: css`
        background: ${theme.gradients.danger};
      `,
    })[$state]}
`
