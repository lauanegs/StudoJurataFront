export interface SimuladoHeaderProps {
  titulo: string
  segundos: number
  regressivo?: boolean
  onExit?: () => void
  rotuloSair?: string
}
