import { LineChart } from '@mantine/charts'

import { theme as tokens } from '@/styles/theme'
import { LIMIAR_BAIXO_DESEMPENHO } from '@/utils/desempenho'
import { formatarPorcentagem } from '@/utils/format'

import type { GraficoLinhaProps } from './types'

export function GraficoLinha({ pontos, rotuloAcessivel = 'Evolução ao longo do tempo', altura = 220 }: GraficoLinhaProps) {
  if (pontos.length < 2) return null

  const data = pontos.map((ponto) => ({ chave: ponto.chave, valor: ponto.valor }))
  const rotuloDaChave = new Map(pontos.map((ponto) => [ponto.chave, ponto.rotulo]))
  const rotulo = (chave: unknown) => rotuloDaChave.get(String(chave)) ?? String(chave)

  return (
    <LineChart
      h={altura}
      data={data}
      dataKey="chave"
      series={[{ name: 'valor', label: 'Nota', color: tokens.colors.blue }]}
      referenceLines={[{ y: LIMIAR_BAIXO_DESEMPENHO, label: `${LIMIAR_BAIXO_DESEMPENHO}%`, color: tokens.colors.textTertiary }]}
      xAxisProps={{ tickFormatter: rotulo }}
      tooltipProps={{ labelFormatter: rotulo }}
      yAxisProps={{ domain: [0, 100] }}
      valueFormatter={(valor) => formatarPorcentagem(valor)}
      withDots
      lineChartProps={{ margin: { left: 0, right: 8, top: 8, bottom: 0 } }}
      aria-label={rotuloAcessivel}
    />
  )
}
