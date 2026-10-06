export interface PontoGraficoLinha {
  chave: string
  rotulo: string
  valor: number
}

export interface GraficoLinhaProps {
  pontos: PontoGraficoLinha[]
  rotuloAcessivel?: string
  altura?: number
}
