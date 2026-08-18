import styled from 'styled-components'

import { MoedaIcone } from '../MoedaIcone'
import { formatarMoedas } from '../../../utils/format'

/**
 * Confirmado no Figma: badge de moedas translúcido sobre fundo roxo — usado
 * dentro de um Banner (Home do aluno) ou de um cabeçalho no mesmo tom
 * (Perfil do aluno). Antes duplicado em cada tela; agora é um componente só.
 */
const Container = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};

  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};

  background: rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.radius.pill};

  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`

interface SaldoMoedasProps {
  moedas: number
  /** "80 moedas" (Home) vs "+ 300,00" (resultado do simulado) — o texto varia por tela. */
  sufixo?: string
}

export function SaldoMoedas({ moedas, sufixo = 'moedas' }: SaldoMoedasProps) {
  return (
    <Container>
      <MoedaIcone size={20} aria-hidden="true" />
      {formatarMoedas(moedas)} {sufixo}
    </Container>
  )
}
