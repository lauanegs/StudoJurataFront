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
      // Sem isso, nome de disciplina comprido (ex.: "Programação
      // Gamificada") ficava cortado/vazando pra fora da área do eixo —
      // reserva espaço fixo suficiente pro rótulo mais comum.
      yAxisProps={{ width: 150 }}
      // O Recharts soma essa margem À largura do eixo Y — com as duas
      // juntas, o gráfico inteiro ficava puxado pra direita (muito espaço
      // vazio à esquerda). Zerando a margem, só o yAxisProps.width acima
      // decide o espaço reservado pro rótulo.
      barChartProps={{ margin: { left: 0, right: 24, top: 8, bottom: 8 } }}
      aria-label={rotuloAcessivel}
    />
  )
}
