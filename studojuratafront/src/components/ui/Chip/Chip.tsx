import { Pill } from '@mantine/core'

import { theme as tokens } from '../../../styles/theme'
import { comTamanho } from '../../../utils/redimensionarIcone'
import type { ChipProps } from './types'

const CORES: Record<
  NonNullable<ChipProps['variant']>,
  { bg: string; texto: string; borda?: string }
> = {
  neutral: { bg: 'rgba(230, 234, 242, 0.6)', texto: tokens.colors.textTertiary },
  purple: { bg: tokens.colors.purpleSoft, texto: tokens.colors.purple, borda: tokens.colors.purple },
  blue: { bg: tokens.colors.infoBackground, texto: tokens.colors.infoText, borda: tokens.colors.blue },
}

export function Chip({
  children,
  icon,
  onRemove,
  rotuloRemover,
  variant = 'neutral',
  disabled,
}: ChipProps) {
  const cor = CORES[variant]

  return (
    <Pill
      withRemoveButton={Boolean(onRemove)}
      onRemove={onRemove}
      disabled={disabled}
      removeButtonProps={{ 'aria-label': rotuloRemover ?? `Remover ${String(children)}` }}
      // Confirmado no Figma (tag do "Vincular conteúdo"): 56px de altura,
      // 32px de padding à esquerda, ícone de remover em 24px — bem maior e
      // mais espaçoso do que o tamanho padrão de Pill da Mantine.
      styles={{
        root: {
          backgroundColor: cor.bg,
          color: cor.texto,
          border: cor.borda ? `1px solid ${cor.borda}` : undefined,
          fontWeight: tokens.typography.weights.medium,
          fontSize: tokens.typography.sizes.sm,
          opacity: disabled ? 0.55 : 1,
          gap: tokens.spacing.xs,
          height: '56px',
          paddingInlineStart: tokens.spacing.xl,
          paddingInlineEnd: tokens.spacing.md,
          maxWidth: '100%',
        },
        remove: {
          width: '24px',
          height: '24px',
          minWidth: '24px',
        },
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing.xs, minWidth: 0 }}>
        {comTamanho(icon, 12)}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
      </span>
    </Pill>
  )
}
