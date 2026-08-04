import { useRef, type ReactNode } from 'react'
import styled from 'styled-components'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { IconButton } from '../IconButton'

const Container = styled.section`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.base};
  overflow: hidden;
`

const Cabecalho = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.sm};

  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const TituloBloco = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`

const Icone = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 28px;
  height: 28px;

  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.gradients.primary};
  color: ${({ theme }) => theme.colors.white};

  svg {
    width: 16px;
    height: 16px;
  }
`

const Titulo = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

const Setas = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxs};
`

const Trilha = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};

  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x proximity;

  > * {
    scroll-snap-align: start;
    flex-shrink: 0;
  }

  &::-webkit-scrollbar {
    height: 6px;
  }
`

interface SeparadorCardProps {
  titulo: string
  icon?: ReactNode
  children: ReactNode
  passo?: number
}

export function SeparadorCard({ titulo, icon, children, passo = 260 }: SeparadorCardProps) {
  const trilhaRef = useRef<HTMLDivElement>(null)

  function rolar(direcao: -1 | 1) {
    trilhaRef.current?.scrollBy({ left: passo * direcao, behavior: 'smooth' })
  }

  return (
    <Container>
      <Cabecalho>
        <TituloBloco>
          {icon && <Icone aria-hidden="true">{icon}</Icone>}
          <Titulo>{titulo}</Titulo>
        </TituloBloco>

        <Setas>
          <IconButton label="Rolar para a esquerda" icon={<ChevronLeft />} size="small" onClick={() => rolar(-1)} />
          <IconButton label="Rolar para a direita" icon={<ChevronRight />} size="small" onClick={() => rolar(1)} />
        </Setas>
      </Cabecalho>

      <Trilha ref={trilhaRef}>{children}</Trilha>
    </Container>
  )
}
