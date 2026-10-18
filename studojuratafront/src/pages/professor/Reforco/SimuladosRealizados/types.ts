export interface LinhaSimulado {
  chave: string
  simuladoId: number
  titulo: string
  disciplinaOuAluno: string
  mediaGeral: number | null
  participacao?: { concluidas: number; total: number }
  acertos?: { quantidade: number; total: number }
  tentativaId?: number
}
