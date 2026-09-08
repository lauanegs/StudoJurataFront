import { BarChart } from '@mantine/charts'
import { Rectangle, type BarShapeProps } from 'recharts'

import { theme as tokens } from '../../../styles/theme'
import { calcularFaixasHistograma } from '../../../utils/desempenho'

interface HistogramaProps {
  /** Uma nota (0-100) por aluno/tentativa — o histograma agrupa em faixas de 20 pontos. */
  valores: number[]
  rotuloAcessivel?: string
  /** Em px — maior no modal de detalhamento do que dentro do card compacto. */
  altura?: number
  /** Quando informado, clicar numa coluna chama isso com o rótulo da faixa (ex.: "40-60") — usado no
   * modal de detalhamento pra mostrar quem está naquela faixa (aluno, simulado, nota) abaixo do gráfico. */
  onFaixaClick?: (rotuloFaixa: string) => void
  /** Rótulo da faixa clicada — pinta essa coluna numa cor diferente, marcando a seleção atual. */
  faixaSelecionada?: string | null
}

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
        // Pinta a coluna selecionada com a cor de marca (roxo) em vez da cor
        // padrão da série — só assim dá pra saber, olhando o gráfico, qual
        // faixa está detalhada logo abaixo dele.
        shape: (props: BarShapeProps) => (
          <Rectangle {...props} fill={props.payload?.rotulo === faixaSelecionada ? tokens.colors.purple : props.fill} />
        ),
      }}
      withBarValueLabel
      maxBarWidth={64}
      // Margem direita padrão da Mantine é maior que a esquerda — o
      // gráfico inteiro ficava puxado pra direita dentro do card.
      barChartProps={{ margin: { left: 0, right: 8, top: 8, bottom: 0 } }}
      aria-label={rotuloAcessivel}
    />
  )
}
