import { Children, useState, type ReactNode } from 'react'
import styled from 'styled-components'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Card } from '../Card'
import { IconButton } from '../IconButton'

const Setas = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxs};
  flex-shrink: 0;
`

/** Grade que preenche a largura em `colunas` cartões de tamanho igual, com espaçamento uniforme. */
const Trilha = styled.div<{ $colunas: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $colunas }) => $colunas}, 1fr);
  gap: ${({ theme }) => theme.spacing.lg};

  padding: ${({ theme }) => theme.spacing.xl};
`

interface SeparadorCardProps {
  titulo: string
  icon?: ReactNode
  children: ReactNode
  /** Quantos cartões cabem lado a lado, preenchendo a largura. O excedente vira uma próxima página. */
  colunas: number
}

/**
 * Mesmo Card do design system, só com paginação client-side de uma grade de
 * itens no lugar do corpo — mantém cabeçalho (ícone/título) e o corpo com
 * fundo tingido (`corpoComFundo`, mesmo tom usado em "Desempenho" na home do
 * aluno) idênticos aos demais cards em vez de reimplementar o próprio.
 */
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
