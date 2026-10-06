import type { SimuladoAlunoResponse, TipoDestinacaoSimulado } from '@/dominios/simulados/types'

export interface DetalheSimuladoModalProps {
  aberto: boolean
  onClose: () => void
  simuladoId: number | null
  titulo: string
  turma: string
  disciplina: string
  notaMaxima: number
  tentativas: Pick<SimuladoAlunoResponse, 'id' | 'alunoId' | 'nota'>[]
  data?: string
  tipoDestinacao?: TipoDestinacaoSimulado
  alunoFiltrado?: string
}
