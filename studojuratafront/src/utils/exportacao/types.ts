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
  imagem?: ImagemGrafico | null
}

export interface LinhaPlanilha {
  rotulo: string
  valor: string | number
}

export interface AbaPlanilha {
  nome: string
  colunaRotulo: string
  colunaValor: string
  linhas: LinhaPlanilha[]
  imagem?: ImagemGrafico | null
}
