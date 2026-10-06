export interface Aniversariante {
  id: number
  nome: string
  /** dd/MM formatado. */
  data: string
  hoje: boolean
  complemento: string
  /** Dias até o aniversário, usado para ordenar. */
  distancia: number
}

export type NivelDesempenho = 'baixo' | 'medio' | 'alto'

export interface DisponibilidadeSimulado {
  indisponivel: boolean
  /** Não abre mais: simulado encerrado ou prazo vencido (diferente de "ainda vai abrir"). */
  encerrado?: boolean
  motivo?: string
}

export type ReacaoSkin = 'neutro' | 'feliz' | 'triste'
