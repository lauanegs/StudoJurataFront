import styled from 'styled-components'

import { LetterBadge } from '../LetterBadge'

export type AlternativeStatus = 'neutral' | 'correct' | 'incorrect'

/**
 * Confirmado no Figma: card sempre branco com borda neutra fina — sem tingir
 * o fundo/borda de verde ou vermelho (isso fica só no badge e na legenda).
 */
const Container = styled.div<{ $status: AlternativeStatus }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  width: 100%;
  min-height: 60px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};

  border: 2px solid rgba(115, 115, 115, 0.15);
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
`

const Texto = styled.span`
  flex: 1;
  min-width: 0;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`

const Legenda = styled.span<{ $status: AlternativeStatus }>`
  flex-shrink: 0;

  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.regular};
  color: ${({ theme, $status }) =>
    $status === 'correct' ? theme.colors.success : theme.colors.error};
`

interface AlternativaCardProps {
  letra: string
  texto: string
  status?: AlternativeStatus
  /** Sobrescreve a legenda automática ("Resposta correta" / "Resposta do aluno"). */
  legenda?: string
}

/** Alternativa em modo leitura — usada nas revisões pós-simulado. */
export function AlternativaCard({ letra, texto, status = 'neutral', legenda }: AlternativaCardProps) {
  const legendaPadrao =
    status === 'correct' ? 'Resposta correta' : status === 'incorrect' ? 'Resposta do aluno' : null

  const textoLegenda = legenda ?? legendaPadrao

  return (
    <Container $status={status}>
      <LetterBadge
        letra={letra}
        state={status === 'correct' ? 'correct' : status === 'incorrect' ? 'incorrect' : 'default'}
        size="small"
      />

      <Texto>{texto}</Texto>

      {textoLegenda && status !== 'neutral' && <Legenda $status={status}>{textoLegenda}</Legenda>}
    </Container>
  )
}
