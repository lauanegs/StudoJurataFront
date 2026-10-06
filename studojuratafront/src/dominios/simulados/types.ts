import type { EntidadeBase } from '@/dominios/comum/types'
import type { ConteudoPlano } from '@/dominios/planejamento/types'

export type StatusQuestao = 'PENDENTE' | 'APROVADA' | 'REJEITADA'

export type StatusSimulado = 'RASCUNHO' | 'PUBLICADO' | 'ENCERRADO'

export type StatusSimuladoAluno = 'PENDENTE' | 'CONCLUIDO'

export type StatusSimuladoQuestao = 'ATIVA' | 'REMOVIDA'

export type TipoDestinacaoSimulado = 'TODOS' | 'ESPECIFICO'

export type TipoQuestao = 'ALTERNATIVAS' | 'VERDADEIRO_FALSO'

export type NivelDificuldade = 'FACIL' | 'MEDIA' | 'DIFICIL'

export type OrigemQuestao = 'PROFESSOR' | 'IA'

export interface QuestaoConteudo extends EntidadeBase {
  questao: { id: number }
  conteudoPlano: ConteudoPlano
}

export interface QuestaoRequest {
  enunciado: string
  tipo: TipoQuestao
  disciplinaId?: number | null
  nivelDificuldade?: NivelDificuldade | null
  origem?: OrigemQuestao | null
}

export interface QuestaoResponse {
  id: number
  enunciado: string
  tipo: TipoQuestao
  disciplinaId?: number | null
  nivelDificuldade?: NivelDificuldade | null
  origem?: OrigemQuestao | null
  status?: StatusQuestao
}

export interface AlternativaRequest {
  questaoId: number
  texto: string
  correta?: boolean
  ordem?: number
}

export interface AlternativaResponse {
  id: number
  questaoId: number
  texto: string
  correta?: boolean
  ordem?: number
}

export interface SimuladoRequest {
  titulo: string
  disciplinaId?: number | null
  planoEnsinoId?: number | null
  turmaId?: number | null
  tipoDestinacao: TipoDestinacaoSimulado
  dataInicio?: string | null
  dataFim?: string | null
  tempoLimite?: number | null
  notaMaxima?: number | null
  quantidadeQuestoes?: number | null
}

export interface SimuladoResponse extends SimuladoRequest {
  id: number
  autor?: string
  status?: StatusSimulado
  createdAt?: string
}

export interface SimuladoQuestaoRequest {
  simuladoId: number
  questaoId: number
  ordem?: number
  pontuacao?: number
}

export interface SimuladoQuestaoResponse {
  id: number
  simuladoId: number
  questaoId: number
  ordem?: number
  pontuacao?: number
  status?: StatusSimuladoQuestao
}

export interface SimuladoAlunoResponse {
  id: number
  simuladoId: number
  alunoId: number
  quantidadeAcertos?: number
  nota?: number
  tempoGasto?: number
  finalizadoPorTempo?: boolean
  status?: StatusSimuladoAluno
  diasProximaRevisao?: number
}

export interface QuestaoAlunoResponse {
  id: number
  simuladoAlunoId: number
  questaoId: number
  alternativaId?: number | null
  alternativasVerdadeirasIds?: number[]
  respondida?: boolean
  acertou?: boolean
  tempoResposta?: number
}

export interface LancarSimuladoRequest {
  alunoIds?: number[]
}

export interface ConferenciaDaQuestao {
  acertou: boolean
  alternativasCorretasIds: number[]
}

export interface FinalizarSimuladoRequest {
  respostas: {
    questaoId: number
    alternativaId: number | null
    alternativasVerdadeiras?: number[]
    tempoResposta?: number
  }[]
  tempoGastoTotal: number
  finalizadoPorTempo: boolean
}

export interface TentativaDesempenho {
  id: number
  alunoId: number
  simuladoId: number
  simuladoTitulo: string
  turmaId: number | null
  turma: string | null
  disciplinaId: number | null
  disciplina: string | null
  nota: number
  notaMaxima: number
  percentual: number
  data: string | null
  tipoDestinacao: TipoDestinacaoSimulado
}

export interface AlternativaDaTentativa {
  id: number
  texto: string
  ordem?: number
}

export interface QuestaoDaTentativa {
  questaoId: number
  enunciado: string
  tipo: TipoQuestao
  alternativas: AlternativaDaTentativa[]
}

export interface ProvaDaTentativa {
  simuladoAlunoId: number
  status: StatusSimuladoAluno
  questoes: QuestaoDaTentativa[]
  gabarito?: Record<string, boolean>
}
