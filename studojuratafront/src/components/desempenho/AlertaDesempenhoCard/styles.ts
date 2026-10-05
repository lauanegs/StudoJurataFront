import type { Tom } from './types'
import styled from 'styled-components'

export const Container = styled.div<{ $tom: Tom }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};

  background: ${({ theme, $tom }) =>
    $tom === 'success' ? theme.colors.successBackground : theme.colors.warningBackground};
  border: 1px solid ${({ theme, $tom }) => ($tom === 'success' ? theme.colors.success : theme.colors.warning)};
  border-radius: ${({ theme }) => theme.radius.md};
`

export const Icone = styled.span<{ $tom: Tom }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 40px;
  height: 40px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme, $tom }) => ($tom === 'success' ? theme.colors.success : theme.colors.warning)};
  color: ${({ theme }) => theme.colors.textStrong};

  svg {
    width: 20px;
    height: 20px;
  }
`

export const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 0;
`

export const Titulo = styled.strong<{ $tom: Tom }>`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme, $tom }) => ($tom === 'success' ? theme.colors.successText : theme.colors.warningText)};
`

export const Descricao = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Acao = styled.div`
  margin-left: auto;
  align-self: center;
  flex-shrink: 0;
`
