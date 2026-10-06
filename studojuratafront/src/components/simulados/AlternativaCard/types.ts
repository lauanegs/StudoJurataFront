export type AlternativeStatus = 'neutral' | 'correct' | 'incorrect'

export interface AlternativaCardProps {
  letra: string
  texto: string
  status?: AlternativeStatus
  legenda?: string
}
