import styled from 'styled-components'
import { Play } from 'lucide-react'

import { Button } from '../Button'
import { Tag } from '../Tag'

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
  box-shadow: ${({ theme }) => theme.shadow.light};

  transition: box-shadow ${({ theme }) => theme.transition.base};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.base};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`

const Conteudo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 0;
`

const Titulo = styled.strong`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
`

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  flex-wrap: wrap;

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`

interface SimuladoIniciarCardProps {
  /** Confirmado no Figma: o destaque do card é a disciplina, não o título interno do simulado. */
  disciplina: string
  quantidadeQuestoes?: number | null
  /** Bloqueia o início (fora da janela de data, por exemplo). */
  indisponivel?: boolean
  motivoIndisponivel?: string
  loading?: boolean
  onStart?: () => void
}

export function SimuladoIniciarCard({
  disciplina,
  quantidadeQuestoes,
  indisponivel = false,
  motivoIndisponivel,
  loading = false,
  onStart,
}: SimuladoIniciarCardProps) {
  return (
    <Container>
      <Conteudo>
        <Titulo>{disciplina}</Titulo>

        <Meta>
          <span>Studo Jurata{quantidadeQuestoes ? ` | ${quantidadeQuestoes} questões` : ''}</span>
          {indisponivel && motivoIndisponivel && (
            <Tag variant="warning" size="small">
              {motivoIndisponivel}
            </Tag>
          )}
        </Meta>
      </Conteudo>

      <Button
        icon={<Play />}
        onClick={onStart}
        disabled={indisponivel}
        loading={loading}
      >
        Iniciar
      </Button>
    </Container>
  )
}
