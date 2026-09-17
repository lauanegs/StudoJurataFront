import type { EntidadeBase, StatusAtivoInativo } from './comum'
import type { Curso } from './curriculo'
import type { Aluno, Professor } from './pessoas'
import type { HorarioTurma, TurmaDisciplina } from './turmas'

/** Próprio de PlanoEnsino/PlanoAula — matrícula cíclica não tem "inativo", só "concluído" (ciclo fechado). */
export type StatusPlano = 'ATIVO' | 'CONCLUIDO'

export interface PlanoEnsino extends EntidadeBase {
  turmaDisciplina?: TurmaDisciplina | null
  /** Professor responsável pelo plano (turmaDisciplina é opcional). */
  professor?: Professor | null
  curso: Curso
  cargaHoraria?: number
  ementa?: string
  objetivoGeral?: string
  metodologia?: string
  dataInicio?: string
  dataFim?: string
  /** Matrícula cíclica: um plano não é "inativado", ele conclui o ciclo (a turma pode receber um novo plano). */
  status?: StatusPlano
}

export interface ConteudoPlano extends EntidadeBase {
  planoEnsino?: PlanoEnsino | null
  titulo?: string
  descricao?: string
  ordem?: number
  status?: StatusAtivoInativo
}

export interface PlanoAula extends EntidadeBase {
  turmaDisciplina: TurmaDisciplina
  planoEnsino: PlanoEnsino
  status?: StatusPlano
}

export interface Aula extends EntidadeBase {
  planoAula: PlanoAula
  /**
   * Horário semanal da turma a que esta aula corresponde — quando
   * informado, cargaHoraria abaixo é CALCULADA a partir dele (hora fim -
   * hora início) pelo back, não editável. Ausente só em aula fora do
   * horário fixo (reposição etc.), onde cargaHoraria continua digitada.
   */
  horarioTurma?: HorarioTurma | null
  /** Em horas, aceita fração (ex.: 1.5 = 1h30). */
  cargaHoraria?: number
  dataPrevista?: string
  ordem?: number
  titulo?: string
  dataPublicacao?: string
  observacoes?: string
  status?: StatusAtivoInativo
}

/**
 * Geração em lote de aulas pra um plano de aula — segue os horários já
 * cadastrados na turma (HorarioTurma), ciclando entre eles a partir de
 * dataInicio até completar a quantidade pedida.
 */
export interface GerarAulasLoteRequest {
  quantidade: number
  dataInicio?: string
  /** Vira "{tituloBase} {ordem}" em cada aula gerada — default "Aula" quando vazio. */
  tituloBase?: string
}

export interface AulaConteudo extends EntidadeBase {
  aula: Aula
  conteudoPlano: ConteudoPlano
}

export interface Frequencia extends EntidadeBase {
  aluno: Aluno
  aula: Aula
  presente: boolean
  justificativa?: string
}

/** Corpo de POST /aulas/{id}/frequencias/chamada (dto/ChamadaRequest.java). */
export interface ChamadaRequest {
  alunos: {
    alunoId: number
    presente: boolean
    justificativa?: string
  }[]
}

/** Estatísticas de GET /plano-aula/{id}/estatisticas (Map<String, Object>). */
export interface EstatisticasPlanoAula {
  [chave: string]: number | string | null
}
