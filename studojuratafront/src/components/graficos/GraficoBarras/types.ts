export interface ItemGraficoBarras {
  chave: string
  rotulo: string
  valor: number
}

export interface GraficoBarrasProps {
  itens: ItemGraficoBarras[]
  rotuloAcessivel?: string
  altura?: number
}
