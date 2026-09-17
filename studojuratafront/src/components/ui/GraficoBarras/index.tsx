import { BarChart } from '@mantine/charts'

import { nivelDesempenho, type NivelDesempenho } from '../../../utils/desempenho'
import { formatarPorcentagem } from '../../../utils/format'

const CORES_NIVEL: Record<NivelDesempenho, string> = {
  baixo: '#FF383C',
  medio: '#FFCC00',
  alto: '#34C759',
}

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
      series={[{ name: 'valor', color: '#049DBF' }]}
      getBarColor={(valor) => CORES_NIVEL[nivelDesempenho(valor)]}
      valueFormatter={(valor) => formatarPorcentagem(valor)}
      // Mesmo raio (radius.md) do resto do sistema — só as pontas
      // da direita, que é pra onde a barra cresce (orientation="vertical" =
      // barras horizontais aqui).
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
