export interface Aniversariante {
  id: number
  nome: string
  data: string
  hoje: boolean
  complemento: string
  distancia: number
}

export type NivelDesempenho = 'baixo' | 'medio' | 'alto'

export interface DisponibilidadeSimulado {
  indisponivel: boolean
  encerrado?: boolean
  motivo?: string
}

export type ReacaoSkin = 'neutro' | 'feliz' | 'triste'
