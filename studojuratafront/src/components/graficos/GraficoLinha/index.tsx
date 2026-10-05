import { LineChart } from '@mantine/charts'

import { theme as tokens } from '@/styles/theme'
import { LIMIAR_BAIXO_DESEMPENHO } from '@/utils/desempenho'
import { formatarPorcentagem } from '@/utils/format'

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

/** Evolução ao longo do tempo, com linha de referência no limiar de baixo desempenho. */
export function GraficoLinha({ pontos, rotuloAcessivel = 'Evolução ao longo do tempo', altura = 220 }: GraficoLinhaProps) {
  if (pontos.length < 2) return null

  // O eixo X usa a chave única: simulados com o mesmo título/data têm rótulos iguais
  // e o tooltip mostraria o valor do primeiro deles em qualquer um dos pontos.
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
      // A margem direita padrão da Mantine é maior e descentraliza o gráfico.
      lineChartProps={{ margin: { left: 0, right: 8, top: 8, bottom: 0 } }}
      aria-label={rotuloAcessivel}
    />
  )
}
