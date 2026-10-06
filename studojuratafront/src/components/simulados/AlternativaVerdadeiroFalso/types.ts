export type EstadoBotaoVF = 'default' | 'selected' | 'correct' | 'incorrect'

export interface AlternativaVerdadeiroFalsoProps {
  texto: string
  valor: boolean | null
  onSelect?: (valor: boolean) => void
  disabled?: boolean
  revelado?: boolean
  correta?: boolean
}
