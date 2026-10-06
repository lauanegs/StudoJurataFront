import { BarChart } from '@mantine/charts'
import { Rectangle, type BarShapeProps } from 'recharts'

import { theme as tokens } from '@/styles/theme'
import { calcularFaixasHistograma } from '@/utils/desempenho'

import type { HistogramaProps } from './types'

export function Histograma({
  valores,
  rotuloAcessivel = 'Distribuição de notas',
  altura = 220,
  onFaixaClick,
  faixaSelecionada,
}: HistogramaProps) {
  const data = calcularFaixasHistograma(valores)

  return (
    <BarChart
      h={altura}
      data={data}
      dataKey="rotulo"
      series={[{ name: 'quantidade', color: tokens.colors.blue }]}
      barProps={{
        radius: [8, 8, 0, 0],
        cursor: onFaixaClick ? 'pointer' : undefined,
        onClick: onFaixaClick
          ? (item, index) => onFaixaClick(item?.payload?.rotulo ?? data[index]?.rotulo)
          : undefined,
        shape: (props: BarShapeProps) => (
          <Rectangle {...props} fill={props.payload?.rotulo === faixaSelecionada ? tokens.colors.purple : props.fill} />
        ),
      }}
      withBarValueLabel
      maxBarWidth={64}
      barChartProps={{ margin: { left: 0, right: 8, top: 8, bottom: 0 } }}
      aria-label={rotuloAcessivel}
    />
  )
}
