import type { CSSProperties } from 'react'

import { theme as tokens } from '@/styles/theme'

export const estiloTitulo: CSSProperties = {
  fontSize: tokens.typography.sizes.md,
  fontWeight: tokens.typography.weights.semiBold,
  color: tokens.colors.textSecondary,
}

export const estiloRodape: CSSProperties = {
  padding: `0 var(--mantine-spacing-md) ${tokens.spacing.xl}`,
}
