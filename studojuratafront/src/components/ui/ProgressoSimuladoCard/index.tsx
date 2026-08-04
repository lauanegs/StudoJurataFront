import styled from 'styled-components'

export type QuestionProgressStatus = 'correct' | 'incorrect' | 'current' | 'answered' | 'pending'

const COLORS: Record<QuestionProgressStatus, string> = {
  correct: '#34C759',
  incorrect: '#FF383C',
  current: 'linear-gradient(180deg, #049DBF 0%, rgba(4, 157, 191, 0.8) 100%), #662E9B',
  answered: '#049DBF',
  pending: 'rgba(115, 115, 115, 0.15)',
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};

  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};

  background: ${({ theme }) => theme.colors.white};
  border: 1px solid rgba(115, 115, 115, 0.15);
  border-radius: ${({ theme }) => theme.radius.md};
`

const Title = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  color: ${({ theme }) => theme.colors.textStrong};
  text-align: center;
`

const Track = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
`

const SegmentColumn = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  min-width: 0;
`

const Segment = styled.button<{ $color: string; $navigable: boolean; $pending: boolean }>`
  width: 100%;
  height: 10px;

  border-radius: ${({ theme }) => theme.radius.sm};
  background: ${({ $color }) => $color};
  border: ${({ $pending }) => ($pending ? '1px solid rgba(115, 115, 115, 0.15)' : 'none')};
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
  border-radius: ${({ theme }) => theme.radius.sm};

  font-size: 12px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme, $current }) => ($current ? theme.colors.white : theme.colors.textStrong)};
  background: ${({ $current }) => ($current ? COLORS.current : 'transparent')};
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
