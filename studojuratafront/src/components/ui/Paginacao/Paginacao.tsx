import { ChevronLeft, ChevronRight } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { theme as tokens } from '@/styles/theme'
import { Navegacao, Rotulo } from './styles'
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
    <Navegacao
      component="nav"
      justify="center"
      gap={tokens.spacing.md}
      aria-label={`Paginação, página ${pagina} de ${totalPaginas}`}
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
    </Navegacao>
  )
}
