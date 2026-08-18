import type { ReactNode } from 'react'
import styled from 'styled-components'
import { AlertTriangle } from 'lucide-react'

const Container = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};

  background: ${({ theme }) => theme.colors.warningBackground};
  border: 1px solid ${({ theme }) => theme.colors.warning};
  border-radius: ${({ theme }) => theme.radius.md};
`

const Icone = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 40px;
  height: 40px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme }) => theme.colors.warning};
  color: ${({ theme }) => theme.colors.textStrong};

  svg {
    width: 20px;
    height: 20px;
  }
`

const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 0;
`

const Titulo = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.warningText};
`

const Descricao = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Acao = styled.div`
  margin-left: auto;
  align-self: center;
  flex-shrink: 0;
`

interface AlertaDesempenhoCardProps {
  titulo: string
  descricao: string
  acao?: ReactNode
}

export function AlertaDesempenhoCard({ titulo, descricao, acao }: AlertaDesempenhoCardProps) {
  return (
    <Container role="status">
      <Icone aria-hidden="true">
        <AlertTriangle />
      </Icone>

      <Conteudo>
        <Titulo>{titulo}</Titulo>
        <Descricao>{descricao}</Descricao>
      </Conteudo>

      {acao && <Acao>{acao}</Acao>}
    </Container>
  )
}
