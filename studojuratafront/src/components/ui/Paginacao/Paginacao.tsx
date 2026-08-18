import { Group } from '@mantine/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { IconButton } from '../IconButton'
import { theme as tokens } from '../../../styles/theme'
import type { PaginacaoProps } from './types'

export function Paginacao({
  pagina,
  totalPaginas,
  label,
  temAnterior,
  temProxima,
  onPrevious,
  onNext,
}: PaginacaoProps) {
  return (
    <Group
      component="nav"
      justify="center"
      gap={tokens.spacing.md}
      aria-label={`Paginação, página ${pagina} de ${totalPaginas}`}
      style={{
        padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
        borderTop: `1px solid ${tokens.colors.border}`,
      }}
    >
      <IconButton
        label="Página anterior"
        icon={<ChevronLeft />}
        disabled={!temAnterior}
        onClick={onPrevious}
      />

      <span
        aria-live="polite"
        style={{
          fontSize: tokens.typography.sizes.sm,
          fontWeight: tokens.typography.weights.semiBold,
          color: tokens.colors.textSecondary,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {label}
      </span>

      <IconButton
        label="Próxima página"
        icon={<ChevronRight />}
        disabled={!temProxima}
        onClick={onNext}
      />
    </Group>
  )
}
