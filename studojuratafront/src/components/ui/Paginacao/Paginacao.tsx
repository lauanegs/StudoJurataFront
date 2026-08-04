import { ChevronLeft, ChevronRight } from 'lucide-react'

import { IconButton } from '../IconButton'
import * as S from './styles'
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
    <S.Container aria-label={`Paginação, página ${pagina} de ${totalPaginas}`}>
      <IconButton
        label="Página anterior"
        icon={<ChevronLeft />}
        disabled={!temAnterior}
        onClick={onPrevious}
      />

      <S.Rotulo aria-live="polite">{label}</S.Rotulo>

      <IconButton
        label="Próxima página"
        icon={<ChevronRight />}
        disabled={!temProxima}
        onClick={onNext}
      />
    </S.Container>
  )
}
