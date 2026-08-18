import { Switch } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import type { ToggleProps } from './types'

/**
 * Switch de dois estados. Nas telas do Studo Jurata ele representa
 * StatusAtivoInativo / StatusTurma — por isso `textoLigado`/`textoDesligado`
 * mostram o rótulo real do enum ao lado do controle.
 */
export function Toggle({
  ligado,
  onChange,
  label,
  rotuloAcessivel,
  textoLigado,
  textoDesligado,
  descricao,
  disabled,
  id,
}: ToggleProps) {
  return (
    <Switch
      id={id}
      checked={ligado}
      onChange={(evento) => onChange(evento.currentTarget.checked)}
      disabled={disabled}
      aria-label={rotuloAcessivel ?? label}
      description={descricao}
      size="md"
      label={
        (label || textoLigado || textoDesligado) && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing.xs }}>
            {label && (
              <span style={{ fontSize: tokens.typography.sizes.sm, color: tokens.colors.textStrong }}>
                {label}
              </span>
            )}
            {(textoLigado || textoDesligado) && (
              <span
                style={{
                  fontSize: tokens.typography.sizes.sm,
                  fontWeight: tokens.typography.weights.medium,
                  color: ligado ? tokens.colors.successText : tokens.colors.textTertiary,
                }}
              >
                {ligado ? textoLigado : textoDesligado}
              </span>
            )}
          </span>
        )
      }
      styles={{
        track: {
          background: ligado ? tokens.gradients.primary : tokens.colors.borderStrong,
          border: 'none',
        },
      }}
    />
  )
}
