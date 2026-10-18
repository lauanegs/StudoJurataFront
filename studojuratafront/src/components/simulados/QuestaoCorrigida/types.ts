export interface AlternativaCorrigida {
  id: number
  texto: string
  correta?: boolean
}

export interface QuestaoCorrigidaProps {
  numero: number
  enunciado: string
  ehVF: boolean
  respondida: boolean
  acertou: boolean
  rotuloAcerto: string
  rotuloErro: string
  alternativas: AlternativaCorrigida[]
  marcadasVerdadeiras: Set<number>
  alternativaMarcada: number | null
}
