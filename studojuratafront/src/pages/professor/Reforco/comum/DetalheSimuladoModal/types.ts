import type { SimuladoAlunoResponse, TipoDestinacaoSimulado } from '@/types/simulados'

export interface DetalheSimuladoModalProps {
  aberto: boolean
  onClose: () => void
  simuladoId: number | null
  titulo: string
  turma: string
  disciplina: string
  notaMaxima: number
  /** Tentativas concluídas deste simulado. */
  tentativas: Pick<SimuladoAlunoResponse, 'id' | 'alunoId' | 'nota'>[]
  /** dataInicio do simulado, com createdAt como reserva — exibida como "Aplicado em". */
  data?: string
  tipoDestinacao?: TipoDestinacaoSimulado
  /** Nome do aluno, quando o detalhamento foi aberto com um filtro de aluno aplicado (tela "Desempenho por simulado"). */
  alunoFiltrado?: string
}
