import type { EntidadeBase } from './comum'
import type { ConteudoPlano } from './planejamento'

export type StatusQuestao = 'PENDENTE' | 'APROVADA' | 'REJEITADA'

export type StatusSimulado = 'RASCUNHO' | 'PUBLICADO' | 'ENCERRADO'

export type StatusSimuladoAluno = 'PENDENTE' | 'CONCLUIDO'

export type StatusSimuladoQuestao = 'ATIVA' | 'REMOVIDA'

export type TipoDestinacaoSimulado = 'TODOS' | 'ESPECIFICO'

export type TipoQuestao = 'ALTERNATIVAS' | 'VERDADEIRO_FALSO'

export type NivelDificuldade = 'FACIL' | 'MEDIA' | 'DIFICIL'

export type OrigemQuestao = 'PROFESSOR' | 'IA'

/**
 * Vínculo questão-conteúdo (aba "Conteúdo" do QuestaoEditor) — alimenta o
 * cálculo de desempenho por conteúdo/nível que decide o reforço (back:
 * RecomendacaoService). `questao` só carrega o `id`: o endpoint devolve a
 * entidade completa, mas nada na tela usa mais que isso — o resto do dado da
 * questão já está no estado local do editor.
 */
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
  /** LocalDateTime — "YYYY-MM-DDTHH:mm:ss". */
  dataInicio?: string | null
  dataFim?: string | null
  /** Em minutos. */
  tempoLimite?: number | null
  notaMaxima?: number | null
  quantidadeQuestoes?: number | null
}

export interface SimuladoResponse extends SimuladoRequest {
  id: number
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
  /** Em segundos. */
  tempoGasto?: number
  finalizadoPorTempo?: boolean
  status?: StatusSimuladoAluno
  /** Só vem preenchido na resposta de finalizar() — dias até a próxima revisão por repetição espaçada (undefined se o simulado não cobre conteúdo rastreado, ou já dominado). */
  diasProximaRevisao?: number
}

export interface QuestaoAlunoResponse {
  id: number
  simuladoAlunoId: number
  questaoId: number
  alternativaId?: number | null
  /** Ids das afirmações que o aluno marcou como Verdadeiras (só questão VERDADEIRO_FALSO). */
  alternativasVerdadeirasIds?: number[]
  /** false = questão deixada em branco. Sem isso, "respondeu e errou tudo" em V/F fica indistinguível de "em branco". */
  respondida?: boolean
  acertou?: boolean
  tempoResposta?: number
}

/** POST /simulados/{id}/lancar. */
export interface LancarSimuladoRequest {
  alunoIds?: number[]
}

/** POST /simulado-aluno/{id}/finalizar. */
export interface FinalizarSimuladoRequest {
  respostas: {
    questaoId: number
    /** Nulo quando a questão foi deixada em branco. Ignorado em questão VERDADEIRO_FALSO. */
    alternativaId: number | null
    /**
     * Só usado em questão VERDADEIRO_FALSO: ids das alternativas (afirmações)
     * marcadas como Verdadeiras — as demais contam como marcadas Falsas.
     */
    alternativasVerdadeiras?: number[]
    tempoResposta?: number
  }[]
  /** Tempo total da tentativa, em segundos. */
  tempoGastoTotal: number
  finalizadoPorTempo: boolean
}
