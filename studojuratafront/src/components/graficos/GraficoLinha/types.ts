export interface PontoGraficoLinha {
  chave: string
  rotulo: string
  /** 0 a 100. */
  valor: number
}

export interface GraficoLinhaProps {
  pontos: PontoGraficoLinha[]
  rotuloAcessivel?: string
  /** Em px — maior no modal de detalhamento do que dentro do card compacto. */
  altura?: number
}
