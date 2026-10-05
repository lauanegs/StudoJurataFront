import { CORES_NIVEL_DESEMPENHO, nivelDesempenho } from '@/utils/desempenho'
import { comTamanho } from '@/utils/redimensionarIcone'

import { Container, Cabecalho, IconeSelo, Conteudo, Titulo, Descricao, BarraPorcentagem, Valor } from './styles'
import type { DesempenhoCardProps } from './types'

export function DesempenhoCard({
  titulo,
  descricao,
  porcentagem,
  icon,
  orientacao = 'vertical',
  onClick,
}: DesempenhoCardProps) {
  const valor = Math.min(100, Math.max(0, porcentagem))
  const cor = CORES_NIVEL_DESEMPENHO[nivelDesempenho(valor)]
  const horizontal = orientacao === 'horizontal'

  return (
    <Container
      $clicavel={Boolean(onClick)}
      $horizontal={horizontal}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (evento) => {
              if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <Cabecalho $horizontal={horizontal}>
        {icon && <IconeSelo aria-hidden="true">{comTamanho(icon, 16)}</IconeSelo>}

        <Conteudo>
          <Titulo>{titulo}</Titulo>
          {descricao && <Descricao>{descricao}</Descricao>}
        </Conteudo>
      </Cabecalho>

      <BarraPorcentagem
        $cor={cor}
        $horizontal={horizontal}
        role="progressbar"
        aria-valuenow={Math.round(valor)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Desempenho em ${titulo}`}
      >
        <Valor>{Math.round(valor)}%</Valor>
      </BarraPorcentagem>
    </Container>
  )
}
