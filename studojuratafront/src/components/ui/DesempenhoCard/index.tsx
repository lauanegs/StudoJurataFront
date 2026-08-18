import type { ReactNode } from 'react'
import styled from 'styled-components'

const Container = styled.article`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
`

const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  min-width: 0;
`

const Titulo = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Descricao = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Bloco = styled.div<{ $cor: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 106px;
  height: 106px;
  padding: ${({ theme }) => theme.spacing.md};

  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $cor }) => $cor};
`

const Valor = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.white};
  text-align: center;
  font-variant-numeric: tabular-nums;
`

interface DesempenhoCardProps {
  titulo: string
  descricao?: ReactNode
  /** 0 a 100. */
  porcentagem: number
}

export function DesempenhoCard({ titulo, descricao, porcentagem }: DesempenhoCardProps) {
  const valor = Math.min(100, Math.max(0, porcentagem))
  const cor = valor < 40 ? '#FF383C' : valor < 70 ? '#FFCC00' : '#34C759'

  return (
    <Container>
      <Conteudo>
        <Titulo>{titulo}</Titulo>
        {descricao && <Descricao>{descricao}</Descricao>}
      </Conteudo>

      <Bloco
        $cor={cor}
        role="progressbar"
        aria-valuenow={Math.round(valor)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Desempenho em ${titulo}`}
      >
        <Valor>{Math.round(valor)}%</Valor>
      </Bloco>
    </Container>
  )
}
