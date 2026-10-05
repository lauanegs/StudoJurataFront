import { BarChart } from '@mantine/charts'
import { Rectangle, type BarShapeProps } from 'recharts'

import { theme as tokens } from '@/styles/theme'
import { calcularFaixasHistograma } from '@/utils/desempenho'

import type { HistogramaProps } from './types'

/**
 * Distribuição de notas em barras — @mantine/charts (Recharts por baixo).
 * Mostra se a turma é "toda mediana" ou polarizada (grupo indo bem + grupo
 * em dificuldade), coisa que a média sozinha esconde.
 */
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
        // Mesmo raio (radius.md) usado em botões/cards do resto do
        // sistema — só as pontas de cima da barra, que crescem pra cima.
        radius: [8, 8, 0, 0],
        cursor: onFaixaClick ? 'pointer' : undefined,
        // `data.payload` traz o item original ({ rotulo, quantidade }) — usa o
        // índice como reserva se o formato do payload mudar entre versões do Recharts.
        onClick: onFaixaClick
          ? (item, index) => onFaixaClick(item?.payload?.rotulo ?? data[index]?.rotulo)
          : undefined,
        // Destaca a faixa selecionada, detalhada abaixo do gráfico.
        shape: (props: BarShapeProps) => (
          <Rectangle {...props} fill={props.payload?.rotulo === faixaSelecionada ? tokens.colors.purple : props.fill} />
        ),
      }}
      withBarValueLabel
      maxBarWidth={64}
      // A margem direita padrão da Mantine é maior e descentraliza o gráfico.
      barChartProps={{ margin: { left: 0, right: 8, top: 8, bottom: 0 } }}
      aria-label={rotuloAcessivel}
    />
  )
}
