import { BarChart } from '@mantine/charts'

import { theme as tokens } from '../../../styles/theme'
import { CORES_NIVEL_DESEMPENHO, nivelDesempenho } from '../../../utils/desempenho'
import { formatarPorcentagem } from '../../../utils/format'

export interface ItemGraficoBarras {
  chave: string
  rotulo: string
  /** 0 a 100. */
  valor: number
}

interface GraficoBarrasProps {
  itens: ItemGraficoBarras[]
  rotuloAcessivel?: string
  /** Em px — se omitido, calcula pela quantidade de barras (mínimo legível). */
  altura?: number
}

/**
 * Barras horizontais de comparação (ex.: desempenho médio por disciplina) —
 * @mantine/charts, cor por barra segundo o mesmo limiar de desempenho
 * (vermelho/amarelo/verde) usado em todo o resto do app.
 */
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
      // Arredonda só a ponta da direita, para onde a barra cresce.
      barProps={{ radius: [0, 8, 8, 0] }}
      withBarValueLabel
      // Espaço fixo para nomes de disciplina longos não vazarem do eixo.
      yAxisProps={{ width: 150 }}
      // O Recharts soma essa margem à largura do eixo Y; zerada, só
      // yAxisProps.width define o espaço do rótulo.
      barChartProps={{ margin: { left: 0, right: 24, top: 8, bottom: 8 } }}
      aria-label={rotuloAcessivel}
    />
  )
}
