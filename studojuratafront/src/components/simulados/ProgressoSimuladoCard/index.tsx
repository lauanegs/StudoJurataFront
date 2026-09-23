import styled from 'styled-components'

import { theme as tokens } from '../../../styles/theme'
import { corComOpacidade } from '../../../utils/corComOpacidade'

export type QuestionProgressStatus = 'correct' | 'incorrect' | 'current' | 'answered' | 'pending'

/* Cinza esmaecido das bordas e do fundo dos segmentos ainda não respondidos. */
const CINZA_ESMAECIDO = corComOpacidade(tokens.colors.textTertiary, 0.15)

/* Acerto/erro usam degradês próprios, não os tokens success/danger. */
const COLORS: Record<QuestionProgressStatus, string> = {
  correct: tokens.gradients.correct,
  incorrect: tokens.gradients.incorrect,
  // Mesmo realce azul de marca usado na Sidebar.
  current: tokens.gradients.blue,
  answered: tokens.colors.blue,
  pending: CINZA_ESMAECIDO,
}

/* Mais compacto que os 32px do Figma para não ocupar altura demais na prova. */
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${CINZA_ESMAECIDO};
  border-radius: ${({ theme }) => theme.radius.md};
`

const Title = styled.p`
  align-self: center;
  width: fit-content;

  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
  text-align: center;
  white-space: nowrap;
`

/* Centralizado: esticado, cada segmento ficava enorme com poucas questões. */
const Track = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`

const SegmentColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
`

const Segment = styled.button<{ $color: string; $navigable: boolean; $pending: boolean }>`
  width: 40px;
  height: 8px;

  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ $color }) => $color};
  border: ${({ $pending }) => ($pending ? `1px solid ${CINZA_ESMAECIDO}` : 'none')};
  cursor: ${({ $navigable }) => ($navigable ? 'pointer' : 'default')};

  transition: transform ${({ theme }) => theme.transition.fast};

  &:hover:not(:disabled) {
    transform: ${({ $navigable }) => ($navigable ? 'scaleY(1.4)' : 'none')};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.purple};
    outline-offset: 2px;
  }
`

const Number = styled.span<{ $current: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: 24px;
  padding: 4px 8px;
  border-radius: ${({ $current, theme }) => ($current ? theme.radius.sm : theme.radius.md)};

  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme, $current }) => ($current ? theme.colors.white : theme.colors.textSecondary)};
  background: ${({ $current, theme }) => ($current ? COLORS.current : theme.colors.white)};
`

const Legend = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`

const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};

  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const Dot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: ${({ theme }) => theme.radius.circle};
  background: ${({ $color }) => $color};
`

interface ProgressoSimuladoCardProps {
  current: number
  total: number
  status: QuestionProgressStatus[]
  /** Quando informado, cada segmento vira um atalho para a questão. */
  onGoTo?: (indice: number) => void
  /** Some com a legenda durante a prova (só faz sentido na revisão). */
  showLegend?: boolean
}

export function ProgressoSimuladoCard({
  current,
  total,
  status,
  onGoTo,
  showLegend = true,
}: ProgressoSimuladoCardProps) {
  const legendItems: { key: QuestionProgressStatus; label: string }[] = [
    { key: 'answered', label: 'Respondida' },
    { key: 'current', label: 'Atual' },
    { key: 'pending', label: 'Não respondida' },
  ]

  return (
    <Container>
      <Title aria-live="polite">
        Questão {current} de {total}
      </Title>

      <Track role="list">
        {status.map((item, indice) => (
          <SegmentColumn key={indice}>
            <Segment
              type="button"
              role="listitem"
              $color={COLORS[item]}
              $navigable={Boolean(onGoTo)}
              $pending={item === 'pending'}
              disabled={!onGoTo}
              aria-label={`Questão ${indice + 1}: ${item}`}
              aria-current={item === 'current' ? 'step' : undefined}
              onClick={() => onGoTo?.(indice)}
            />
            <Number $current={item === 'current'}>{indice + 1}</Number>
          </SegmentColumn>
        ))}
      </Track>

      {showLegend && (
        <Legend>
          {legendItems.map((item) => (
            <LegendItem key={item.key}>
              <Dot $color={COLORS[item.key]} aria-hidden="true" />
              {item.label}
            </LegendItem>
          ))}
        </Legend>
      )}
    </Container>
  )
}
