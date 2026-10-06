import { Badge } from '@mantine/core'

import { theme as tokens } from '@/styles/theme'
import { corComOpacidade } from '@/utils/corComOpacidade'
import { comTamanho } from '@/utils/redimensionarIcone'
import type { TagProps, TagVariant } from './types'

const CORES: Record<TagVariant, { bg: string }> = {
  success: { bg: corComOpacidade(tokens.colors.success, 0.3) },
  error: { bg: corComOpacidade(tokens.colors.error, 0.3) },
  warning: { bg: corComOpacidade(tokens.colors.warning, 0.3) },
  info: { bg: corComOpacidade(tokens.colors.info, 0.3) },
  neutral: { bg: tokens.colors.background },
}

const TAMANHOS: Record<NonNullable<TagProps['size']>, { fontSize: string; padding: string; icone: number }> = {
  small: { fontSize: '11px', padding: '2px 8px', icone: 12 },
  medium: { fontSize: tokens.typography.sizes.xs, padding: '4px 12px', icone: 12 },
  large: { fontSize: tokens.typography.sizes.sm, padding: '6px 14px', icone: 14 },
}

export function Tag({ children, variant = 'neutral', icon, size = 'medium' }: TagProps) {
  const cor = CORES[variant]
  const tamanho = TAMANHOS[size]

  return (
    <Badge
      variant="light"
      radius="sm"
      leftSection={icon && comTamanho(icon, tamanho.icone)}
      styles={{
        root: {
          backgroundColor: cor.bg,
          color: tokens.colors.textSecondary,
          textTransform: 'none',
          fontWeight: tokens.typography.weights.semiBold,
          fontSize: tamanho.fontSize,
          padding: tamanho.padding,
          height: 'auto',
          lineHeight: tokens.typography.lineHeight.tight,
        },
        label: {
          overflow: 'visible',
          textOverflow: 'unset',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        },
      }}
    >
      {children}
    </Badge>
  )
}
