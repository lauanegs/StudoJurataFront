import type { CSSProperties } from 'react'
import styled from 'styled-components'

import { theme as tokens } from '@/styles/theme'

export const estiloNavegacao: CSSProperties = {
  padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
  borderTop: `1px solid ${tokens.colors.border}`,
}

export const Rotulo = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-variant-numeric: tabular-nums;
`
