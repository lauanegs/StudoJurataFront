import { Group } from '@mantine/core'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { theme as tokens } from '@/styles/theme'
import { estiloNavegacao, Rotulo } from './styles'
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
      style={estiloNavegacao}
    >
      <IconButton
        label="Página anterior"
        icon={<ChevronLeft />}
        disabled={!temAnterior}
        onClick={onPrevious}
      />

      <Rotulo aria-live="polite">{label}</Rotulo>

      <IconButton
        label="Próxima página"
        icon={<ChevronRight />}
        disabled={!temProxima}
        onClick={onNext}
      />
    </Group>
  )
}
