import { BarChart } from '@mantine/charts'

import { theme as tokens } from '@/styles/theme'
import { CORES_NIVEL_DESEMPENHO, nivelDesempenho } from '@/utils/desempenho'
import { formatarPorcentagem } from '@/utils/format'

import type { GraficoBarrasProps } from './types'

export function GraficoBarras({ itens, rotuloAcessivel = 'Comparativo', altura }: GraficoBarrasProps) {
  const data = itens.map((item) => ({ rotulo: item.rotulo, valor: item.valor }))

  return (
    <BarChart
      h={altura ?? Math.max(120, itens.length * 44)}
      data={data}
      dataKey="rotulo"
      orientation="vertical"
      series={[{ name: 'valor', color: tokens.colors.blue }]}
      getBarColor={(valor) => CORES_NIVEL_DESEMPENHO[nivelDesempenho(valor)]}
      valueFormatter={(valor) => formatarPorcentagem(valor)}
      barProps={{ radius: [0, 8, 8, 0] }}
      withBarValueLabel
      yAxisProps={{ width: 150 }}
      barChartProps={{ margin: { left: 0, right: 24, top: 8, bottom: 8 } }}
      aria-label={rotuloAcessivel}
    />
  )
}
