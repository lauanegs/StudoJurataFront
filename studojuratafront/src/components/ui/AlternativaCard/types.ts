export type AlternativaStatus = 'default' | 'correta' | 'incorreta'

export interface AlternativaCardProps {
  letra: string
  texto: string
  status?: AlternativaStatus
}