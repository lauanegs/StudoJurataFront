import type { ImagemGrafico } from '@/components/graficos/RenderizarGrafico'

export interface LinhaPdf {
  rotulo: string
  valor: string | number
}

export interface SecaoPdf {
  titulo: string
  colunaRotulo: string
  colunaValor: string
  linhas: LinhaPdf[]
  /** Desenho do gráfico (Histograma/GraficoBarras/GraficoLinha, capturado via renderizarGraficoComoImagem) — opcional, some acima da tabela de valores exatos. */
  imagem?: ImagemGrafico | null
}

export interface LinhaPlanilha {
  rotulo: string
  valor: string | number
}

export interface AbaPlanilha {
  /** Vira o nome da aba no Excel — cortado em 31 caracteres (limite do formato .xlsx). */
  nome: string
  colunaRotulo: string
  colunaValor: string
  linhas: LinhaPlanilha[]
  /** Desenho do gráfico (Histograma/GraficoBarras/GraficoLinha, capturado via renderizarGraficoComoImagem) — opcional, some acima da tabela nesta aba. */
  imagem?: ImagemGrafico | null
}
