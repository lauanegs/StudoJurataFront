import { LetterBadge } from '@/components/simulados/LetterBadge'

import { Container, Texto, Legenda } from './styles'
import type { AlternativaCardProps } from './types'

/** Alternativa em modo leitura — usada nas revisões pós-simulado. */
export function AlternativaCard({ letra, texto, status = 'neutral', legenda }: AlternativaCardProps) {
  const legendaPadrao =
    status === 'correct' ? 'Resposta correta' : status === 'incorrect' ? 'Resposta do aluno' : null

  const textoLegenda = legenda ?? legendaPadrao

  return (
    <Container>
      <LetterBadge
        letra={letra}
        state={status === 'correct' ? 'correct' : status === 'incorrect' ? 'incorrect' : 'default'}
      />

      <Texto>{texto}</Texto>

      {textoLegenda && status !== 'neutral' && <Legenda $status={status}>{textoLegenda}</Legenda>}
    </Container>
  )
}
