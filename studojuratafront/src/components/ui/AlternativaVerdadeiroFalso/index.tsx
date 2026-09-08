import styled, { css } from 'styled-components'

type EstadoBotaoVF = 'default' | 'selected' | 'correct' | 'incorrect'

/**
 * Confirmado no Figma: cada afirmação de uma questão Verdadeiro/Falso tem
 * dois botões independentes (V e F) à esquerda — não uma letra única como em
 * AlternativaButton — porque cada afirmação é julgada à parte (ver comentário
 * em QuestaoEditor/types.ts sobre a regra de negócio).
 *
 * V e F ficam separados entre si e do card de texto (não fundidos como o
 * badge de letra) — cada peça é uma caixa própria, com um respiro pequeno
 * entre elas, mesmo padrão de espaçamento usado no resto do sistema.
 */
const Container = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing.xs};
  width: 100%;
  min-height: 60px;
`

// Mesma largura renderizada de um badge de letra (LetterBadge: padding 0
// spacing.lg dos dois lados + o glyph) — só que como caixa própria, não
// fundida, então a largura precisa ser fixa em vez de vir do padding.
const BotaoJulgamento = styled.button<{ $estado: EstadoBotaoVF; $blocked: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  width: 64px;

  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.semiBold};
  transition:
    background ${({ theme }) => theme.transition.base},
    border-color ${({ theme }) => theme.transition.base};

  ${({ theme, $estado }) =>
    ({
      default: css`
        background: ${theme.colors.white};
        border: 2px solid ${theme.colors.blueLight};
        color: ${theme.colors.blue};
      `,
      selected: css`
        background: ${theme.colors.blue};
        border: 2px solid ${theme.colors.blue};
        color: ${theme.colors.white};
      `,
      correct: css`
        background: ${theme.gradients.success};
        border: 2px solid transparent;
        color: ${theme.colors.white};
      `,
      incorrect: css`
        background: ${theme.gradients.danger};
        border: 2px solid transparent;
        color: ${theme.colors.white};
      `,
    })[$estado]}

  ${({ $blocked }) =>
    $blocked &&
    css`
      cursor: default;
    `}

  &:focus-visible {
    outline: none;
    box-shadow: ${({ theme }) => theme.shadow.focus};
  }
`

// Mesma caixa do AlternativaCard (borda 2px, raio, texto simples) — só que
// sem a letra fundida à esquerda, já que aqui ela virou os dois botões ao lado.
const CardTexto = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  padding: 0 ${({ theme }) => theme.spacing.md};

  background: ${({ theme }) => theme.colors.white};
  border: 2px solid rgba(115, 115, 115, 0.15);
  border-radius: ${({ theme }) => theme.radius.md};

  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`

interface AlternativaVerdadeiroFalsoProps {
  texto: string
  /** O que o aluno marcou até agora: true = Verdadeiro, false = Falso, null = ainda não julgou. */
  valor: boolean | null
  onSelect?: (valor: boolean) => void
  disabled?: boolean
  /** Revela o gabarito (pós "Confirmar resposta" ou na revisão do resultado). */
  revelado?: boolean
  /** Gabarito: se a afirmação é, de fato, verdadeira. Obrigatório quando revelado=true. */
  correta?: boolean
}

export function AlternativaVerdadeiroFalso({
  texto,
  valor,
  onSelect,
  disabled = false,
  revelado = false,
  correta,
}: AlternativaVerdadeiroFalsoProps) {
  function estadoDoBotao(valorDoBotao: boolean): EstadoBotaoVF {
    if (revelado) {
      if (correta === valorDoBotao) return 'correct'
      if (valor === valorDoBotao) return 'incorrect'
      return 'default'
    }

    return valor === valorDoBotao ? 'selected' : 'default'
  }

  return (
    <Container>
      <BotaoJulgamento
        type="button"
        $estado={estadoDoBotao(true)}
        $blocked={disabled}
        disabled={disabled}
        aria-pressed={valor === true}
        aria-label="Verdadeiro"
        onClick={() => onSelect?.(true)}
      >
        V
      </BotaoJulgamento>

      <BotaoJulgamento
        type="button"
        $estado={estadoDoBotao(false)}
        $blocked={disabled}
        disabled={disabled}
        aria-pressed={valor === false}
        aria-label="Falso"
        onClick={() => onSelect?.(false)}
      >
        F
      </BotaoJulgamento>

      <CardTexto>{texto}</CardTexto>
    </Container>
  )
}
