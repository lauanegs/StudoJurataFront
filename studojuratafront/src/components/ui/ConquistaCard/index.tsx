import styled, { css } from 'styled-components'
import { Award, Lock } from 'lucide-react'

const Container = styled.article<{ $conquistada: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};

  width: 100%;
  min-width: 160px;
  padding: ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  text-align: center;

  ${({ $conquistada }) =>
    !$conquistada &&
    css`
      opacity: 0.6;
    `}
`

const Medalha = styled.span<{ $conquistada: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 56px;
  height: 56px;

  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ theme, $conquistada }) =>
    $conquistada ? theme.colors.warningBackground : theme.colors.background};
  color: ${({ theme, $conquistada }) =>
    $conquistada ? theme.colors.warning : theme.colors.textTertiary};

  svg {
    width: 26px;
    height: 26px;
  }
`

const Titulo = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

const Descricao = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Progresso = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.purple};
`

interface ConquistaCardProps {
  titulo: string
  descricao: string
  conquistada?: boolean
  /** Ex.: "2 de 3" — progresso rumo à conquista. */
  progresso?: string
}

/** Medalha de conquista do aluno (derivada dos simulados concluídos). */
export function ConquistaCard({
  titulo,
  descricao,
  conquistada = true,
  progresso,
}: ConquistaCardProps) {
  return (
    <Container $conquistada={conquistada}>
      <Medalha $conquistada={conquistada} aria-hidden="true">
        {conquistada ? <Award /> : <Lock />}
      </Medalha>

      <Titulo>{titulo}</Titulo>
      <Descricao>{descricao}</Descricao>
      {progresso && <Progresso>{progresso}</Progresso>}
    </Container>
  )
}
