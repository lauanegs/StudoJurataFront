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
      // Padding simétrico reserva o espaço do botão de remover (absolute) sem descentralizar o texto.
      styles={{
        root: {
          position: 'relative',
          backgroundColor: cor.bg,
          color: cor.texto,
          border: cor.borda ? `1px solid ${cor.borda}` : undefined,
          fontWeight: tokens.typography.weights.medium,
          fontSize: tokens.typography.sizes.sm,
          opacity: disabled ? 0.55 : 1,
          display: 'inline-flex',
          alignItems: 'center',
          height: '56px',
          paddingInlineStart: onRemove ? tokens.spacing.xl : tokens.spacing.md,
          paddingInlineEnd: onRemove ? tokens.spacing.xl : tokens.spacing.md,
          maxWidth: '100%',
        },
        label: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        },
        remove: {
          position: 'absolute',
          right: tokens.spacing.xs,
          top: '50%',
          transform: 'translateY(-50%)',
          width: '24px',
          height: '24px',
          minWidth: '24px',
        },
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: tokens.spacing.xs,
          minWidth: 0,
        }}
      >
        {comTamanho(icon, 12)}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
      </span>
    </Pill>
  )
}
