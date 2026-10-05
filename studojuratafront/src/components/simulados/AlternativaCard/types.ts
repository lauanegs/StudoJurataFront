export type AlternativeStatus = 'neutral' | 'correct' | 'incorrect'

export interface AlternativaCardProps {
  letra: string
  texto: string
  status?: AlternativeStatus
  /** Sobrescreve a legenda automática ("Resposta correta" / "Resposta do aluno"). */
  legenda?: string
}
