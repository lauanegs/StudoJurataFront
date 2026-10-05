import { Container, BotaoJulgamento, CardTexto } from './styles'
import type { EstadoBotaoVF, AlternativaVerdadeiroFalsoProps } from './types'

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
