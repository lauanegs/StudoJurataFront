export type EstadoBotaoVF = 'default' | 'selected' | 'correct' | 'incorrect'

export interface AlternativaVerdadeiroFalsoProps {
  texto: string
  /** O que o aluno marcou até agora: true = Verdadeiro, false = Falso, null = ainda não julgou. */
  valor: boolean | null
  onSelect?: (valor: boolean) => void
  disabled?: boolean
  /** Revela o gabarito (pós "Confirmar resposta" ou na revisão do resultado). */
  revelado?: boolean
  /** Gabarito: se a afirmação é, de fato, verdadeira. Obrigatório quando revelado=true. */
  correta?: boolean
}
