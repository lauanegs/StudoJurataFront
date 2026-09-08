import { LineChart } from '@mantine/charts'

import { theme as tokens } from '../../../styles/theme'
import { formatarPorcentagem } from '../../../utils/format'

const LIMIAR = 60

export interface PontoGraficoLinha {
  chave: string
  rotulo: string
  /** 0 a 100. */
  valor: number
}

interface GraficoLinhaProps {
  pontos: PontoGraficoLinha[]
  rotuloAcessivel?: string
  /** Em px — maior no modal de detalhamento do que dentro do card compacto. */
  altura?: number
}

/**
 * Evolução ao longo do tempo (ex.: média da turma entre simulados
 * sucessivos da mesma disciplina) — @mantine/charts. A linha de referência
 * em 60% marca o mesmo limiar do gatilho de reforço manual usado no
 * detalhamento por simulado.
 */
export function GraficoLinha({ pontos, rotuloAcessivel = 'Evolução ao longo do tempo', altura = 220 }: GraficoLinhaProps) {
  if (pontos.length < 2) return null

  const data = pontos.map((ponto) => ({ rotulo: ponto.rotulo, valor: ponto.valor }))

  return (
    <LineChart
      h={altura}
      data={data}
      dataKey="rotulo"
      series={[{ name: 'valor', color: tokens.colors.blue }]}
      referenceLines={[{ y: LIMIAR, label: `${LIMIAR}%`, color: tokens.colors.textTertiary }]}
      yAxisProps={{ domain: [0, 100] }}
      valueFormatter={(valor) => formatarPorcentagem(valor)}
      withDots
      // Margem direita padrão da Mantine é maior que a esquerda — o
      // gráfico inteiro ficava puxado pra direita dentro do card.
      lineChartProps={{ margin: { left: 0, right: 8, top: 8, bottom: 0 } }}
      aria-label={rotuloAcessivel}
    />
  )
}
