import { Badge } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import { comTamanho } from '../../../utils/redimensionarIcone'
import type { TagProps, TagVariant } from './types'

/** As cores vêm de *_VARIANT em utils/labels.ts. */
const CORES: Record<TagVariant, { bg: string; texto: string }> = {
  success: { bg: tokens.colors.successBackground, texto: tokens.colors.successText },
  error: { bg: tokens.colors.errorBackground, texto: tokens.colors.errorText },
  warning: { bg: tokens.colors.warningBackground, texto: tokens.colors.warningText },
  info: { bg: tokens.colors.infoBackground, texto: tokens.colors.infoText },
  neutral: { bg: tokens.colors.background, texto: tokens.colors.textSecondary },
  purple: { bg: tokens.colors.purpleSoft, texto: tokens.colors.purple },
}

export function Tag({ children, variant = 'neutral', icon, ponto, size = 'medium' }: TagProps) {
  const cor = CORES[variant]

  return (
    <Badge
      variant="light"
      radius="sm"
      leftSection={
        (ponto || icon) && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing.xxs }}>
            {ponto && (
              <span
                aria-hidden="true"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'currentColor',
                }}
              />
            )}
            {comTamanho(icon, 12)}
          </span>
        )
      }
      styles={{
        root: {
          backgroundColor: cor.bg,
          color: cor.texto,
          textTransform: 'none',
          fontWeight: tokens.typography.weights.semiBold,
          fontSize: size === 'small' ? '11px' : tokens.typography.sizes.xs,
          padding: size === 'small' ? '2px 8px' : '4px 12px',
          height: 'auto',
          lineHeight: tokens.typography.lineHeight.tight,
        },
      }}
    >
      {children}
    </Badge>
  )
}
