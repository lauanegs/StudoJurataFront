import { Pill } from '@mantine/core'

import { theme as tokens } from '@/styles/theme'
import { comTamanho } from '@/utils/redimensionarIcone'
import { Conteudo, estilosChip, Texto } from './styles'
import type { ChipProps } from './types'

const CORES: Record<
  NonNullable<ChipProps['variant']>,
  { bg: string; texto: string; borda?: string }
> = {
  neutral: { bg: tokens.colors.neutralTint, texto: tokens.colors.textTertiary },
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
      styles={estilosChip(cor, Boolean(onRemove), disabled)}
    >
      <Conteudo>
        {comTamanho(icon, 12)}
        <Texto>{children}</Texto>
      </Conteudo>
    </Pill>
  )
}
