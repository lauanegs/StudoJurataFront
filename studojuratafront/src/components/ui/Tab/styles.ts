import type { CSSProperties } from 'react'
import styled from 'styled-components'

import { theme as tokens } from '@/styles/theme'

export const Envelope = styled.div`
  width: 100%;
  overflow: hidden;
  padding: 0 ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadow.base};
`

export const estiloLista: CSSProperties = { flexWrap: 'nowrap', overflowX: 'auto', border: 'none' }

export const Contador = styled.span<{ $ativa: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ $ativa, theme }) => ($ativa ? theme.colors.purple : theme.colors.background)};
  color: ${({ $ativa, theme }) => ($ativa ? theme.colors.white : theme.colors.textSecondary)};
  font-size: 11px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

export const estilosAba = (ativa: boolean) => ({
  tab: {
    height: '52px',
    padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
    borderRadius: `${tokens.radius.md} ${tokens.radius.md} 0 0`,
    borderBottom: `2px solid ${ativa ? tokens.colors.buttonPurple : tokens.colors.border}`,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semiBold,
    letterSpacing: '-0.8px',
    color: tokens.colors.textSecondary,
    background: ativa ? tokens.colors.neutralTintSoft : 'transparent',
  },
})
