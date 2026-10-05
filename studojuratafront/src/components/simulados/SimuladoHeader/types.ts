export interface SimuladoHeaderProps {
  titulo: string
  /** Segundos decorridos (contagem crescente) ou restantes (regressiva). */
  segundos: number
  /** true quando o simulado tem tempoLimite e estamos contando para trás. */
  regressivo?: boolean
  onExit?: () => void
  rotuloSair?: string
}
