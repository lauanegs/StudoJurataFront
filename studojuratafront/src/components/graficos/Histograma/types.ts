export interface HistogramaProps {
  valores: number[]
  rotuloAcessivel?: string
  altura?: number
  onFaixaClick?: (rotuloFaixa: string) => void
  faixaSelecionada?: string | null
}
