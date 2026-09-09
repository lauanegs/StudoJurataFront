import { Paper } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import type { CardProps } from './types'

const ELEVACAO: Record<NonNullable<CardProps['elevacao']>, { shadow?: string; border?: string }> = {
  none: { border: `2px solid ${tokens.colors.border}` },
  default: { shadow: tokens.shadow.base },
  medium: { shadow: tokens.shadow.card },
}

export function Card({
  children,
  titulo,
  icon,
  actions,
  semPadding = false,
  corpoComFundo = false,
  elevacao = 'default',
  style,
  ...rest
}: CardProps) {
  const temCabecalho = Boolean(titulo || actions)
  const el = ELEVACAO[elevacao]

  return (
    <Paper
      radius="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden',
        boxShadow: el.shadow,
        border: el.border,
        // Confirmado no Figma (frame "home - professor", nó 1:3377): o card
        // com corpo tingido não é opaco — é o próprio Paper translúcido
        // (rgba(255,255,255,0.2)) por trás de um cabeçalho branco sólido.
        background: corpoComFundo ? 'rgba(255, 255, 255, 0.2)' : undefined,
        ...style,
      }}
      {...rest}
    >
      {temCabecalho && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing.md,
            flexWrap: 'wrap',
            padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
            borderBottom: `1px solid ${tokens.colors.border}`,
            background: corpoComFundo ? tokens.colors.white : undefined,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.xs, minWidth: 0 }}>
            {icon && (
              <span
                aria-hidden="true"
                className="icone-card"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: tokens.radius.md,
                  background: tokens.gradients.primary,
                  color: tokens.colors.white,
                }}
              >
                {icon}
              </span>
            )}
            {titulo && (
              <h2
                style={{
                  fontSize: tokens.typography.sizes.md,
                  fontWeight: tokens.typography.weights.semiBold,
                  color: tokens.colors.textStrong,
                }}
              >
                {titulo}
              </h2>
            )}
          </div>

          {actions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.xs, flexWrap: 'wrap' }}>
              {actions}
            </div>
          )}
        </header>
      )}

      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: semPadding ? 0 : tokens.spacing.lg,
        }}
      >
        {children}
      </div>
    </Paper>
  )
}
