import type { AlternativeStatus } from './types'
import styled from 'styled-components'

/**
 * Letra fundida à borda esquerda, como no AlternativaButton; o card fica
 * branco, sem tingir o fundo de verde/vermelho.
 */
export const Container = styled.div`
  display: flex;
  align-items: stretch;

  width: 100%;
  min-height: 60px;

  border: 2px solid rgba(115, 115, 115, 0.15);
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  overflow: hidden;
`

export const Texto = styled.span`
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  padding: 0 ${({ theme }) => theme.spacing.md};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`

export const Legenda = styled.span<{ $status: AlternativeStatus }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 200px;
  padding: 0 ${({ theme }) => theme.spacing.md};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.regular};
  text-align: center;
  color: ${({ theme, $status }) =>
    $status === 'correct' ? theme.colors.success : theme.colors.error};
`
