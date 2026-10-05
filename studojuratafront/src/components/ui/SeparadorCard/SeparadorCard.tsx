import { Children, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { IconButton } from '@/components/ui/IconButton'

import { Setas, Trilha } from './styles'
import type { SeparadorCardProps } from './types'

/** Card com uma grade paginada no cliente no lugar do corpo. */
export function SeparadorCard({ titulo, icon, children, colunas }: SeparadorCardProps) {
  const [pagina, setPagina] = useState(0)

  const itens = Children.toArray(children)
  const totalPaginas = Math.max(1, Math.ceil(itens.length / colunas))
  const paginaAtual = Math.min(pagina, totalPaginas - 1)
  const visiveis = itens.slice(paginaAtual * colunas, paginaAtual * colunas + colunas)

  return (
    <Card
      titulo={titulo}
      icon={icon}
      semPadding
      corpoComFundo
      actions={
        totalPaginas > 1 && (
          <Setas>
            <IconButton
              label="Página anterior"
              icon={<ChevronLeft />}
              variant="neutral"
              size="small"
              disabled={paginaAtual === 0}
              onClick={() => setPagina((p) => p - 1)}
            />
            <IconButton
              label="Próxima página"
              icon={<ChevronRight />}
              variant="neutral"
              size="small"
              disabled={paginaAtual === totalPaginas - 1}
              onClick={() => setPagina((p) => p + 1)}
            />
          </Setas>
        )
      }
    >
      <Trilha $colunas={colunas}>{visiveis}</Trilha>
    </Card>
  )
}
