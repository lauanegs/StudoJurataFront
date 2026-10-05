import type { MotivoRecomendacao } from '@/types/ia'

export type TipoFiltro = 'disciplina' | 'aluno'

export type Aba = 'aprovacao' | 'proximas'

export interface FiltroAplicado {
  turmaId: number
  tipo: TipoFiltro
  especificoId: number
}

export interface LinhaAprovacao {
  simuladoId: number
  titulo: string
  disciplinaRotulo: string
  alunoRotulo: string
  motivoRotulo: string
  dataCriacao?: string
  /** Dias após o prazo de revisão (SimuladoGeradoIA.prazoLancamento) sem o simulado ter sido lançado; null = sem vínculo IA ou ainda no prazo. */
  atrasoDias: number | null
}

/**
 * Item da fila de geração automática: a IA gera sozinha, no prazo calculado.
 * `dataGeracaoPrevista` vem:
 * - de RevisaoConteudo.dataProximoReforco (repetição espaçada) quando existe
 *   — pode ser uma data futura, não só "devida hoje";
 * - de hoje, pra baixo aproveitamento (não tem agenda própria: é um limiar
 *   de nota já atingido agora, não uma data calculada).
 */
export interface ProximaGeracaoIA {
  alunoId: number
  alunoNome: string
  conteudoPlanoId: number
  conteudoTitulo: string
  motivos: MotivoRecomendacao[]
  dataGeracaoPrevista: string
  taxaAcerto?: number
}
