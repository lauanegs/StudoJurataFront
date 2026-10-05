import { Container, Title, Track, SegmentColumn, Segment, Number, Legend, LegendItem, Dot, COLORS } from './styles'
import type { QuestionProgressStatus, ProgressoSimuladoCardProps } from './types'

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
