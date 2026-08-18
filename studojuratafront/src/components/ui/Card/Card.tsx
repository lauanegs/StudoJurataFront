import { Paper } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import type { CardProps } from './types'

const ELEVACAO: Record<NonNullable<CardProps['elevacao']>, { shadow?: string; border?: string }> = {
  none: { border: `1px solid ${tokens.colors.border}` },
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
          background: corpoComFundo ? tokens.colors.background : undefined,
        }}
      >
        {children}
      </div>
    </Paper>
  )
}
