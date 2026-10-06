import type { SelectOption } from '@/components/ui/Select'

import type { TipoDestinacaoSimulado } from '@/dominios/simulados/types'

export interface DesempenhoSimulado {
  simuladoId: number
  titulo: string
  turmaId: number | null
  turma: string
  disciplinaId: number | null
  disciplina: string
  /** Nota média das tentativas sobre a nota máxima, de 0 a 100. */
  percentual: number
  tentativas: number
  notaMaxima: number
  data?: string
  tipoDestinacao?: TipoDestinacaoSimulado
}

export interface LinhaRelatorio {
  chave: string
  rotulo: string
  valor: string
}

export interface SecaoRelatorio {
  titulo: string
  colunaRotulo: string
  colunaValor: string
  linhas: LinhaRelatorio[]
}

export interface EntradaRelatorio {
  desempenhos: DesempenhoSimulado[]
  totalTentativasConcluidas: number
  totalAlunosAvaliados: number
  totalDisciplinasAvaliadas: number
  tabelaDistribuicaoGeral: LinhaRelatorio[]
  tabelaDesempenhoPorDisciplina: LinhaRelatorio[]
  tendenciaPorDisciplina: { disciplina: string; pontos: { chave: string; rotulo: string; valor: number }[] }[]
}

export interface RecorteDesempenho {
  opcoesTurmas: SelectOption<number>[]
  opcoesDisciplinas: SelectOption<number>[]
  opcoesAlunos: SelectOption<number>[]
  turmaId: number | null
  disciplinaId: number | null
  alunoId: number | null
  dataInicio: string
  dataFim: string
}

export interface NotaDetalhada {
  tentativaId: number
  alunoId: number
  simuladoId: number
  simuladoTitulo: string
  /** 0 a 100. */
  percentual: number
}
