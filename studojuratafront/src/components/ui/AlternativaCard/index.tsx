import styled from 'styled-components'

import { LetterBadge } from '../LetterBadge'

export type AlternativeStatus = 'neutral' | 'correct' | 'incorrect'

/**
 * Confirmado no Figma (nós 1:996-1005): a letra é um bloco fundido à borda
 * esquerda (mesmo padrão do AlternativaButton) — o card em si permanece
 * branco com borda neutra fina, sem tingir o fundo de verde/vermelho.
 */
const Container = styled.div`
  display: flex;
  align-items: stretch;

  width: 100%;
  min-height: 60px;

  border: 2px solid rgba(115, 115, 115, 0.15);
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.white};
  overflow: hidden;
`

const Texto = styled.span`
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  padding: 0 ${({ theme }) => theme.spacing.md};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`

const Legenda = styled.span<{ $status: AlternativeStatus }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 200px;
  padding: 0 ${({ theme }) => theme.spacing.md};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.regular};
  text-align: center;
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
