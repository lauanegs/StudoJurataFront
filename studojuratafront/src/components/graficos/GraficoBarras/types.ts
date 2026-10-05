export interface ItemGraficoBarras {
  chave: string
  rotulo: string
  /** 0 a 100. */
  valor: number
}

export interface GraficoBarrasProps {
  itens: ItemGraficoBarras[]
  rotuloAcessivel?: string
  /** Em px — se omitido, calcula pela quantidade de barras (mínimo legível). */
  altura?: number
}
