/**
 * Rótulos legíveis para os enums do back-end. A UI nunca exibe o valor cru
 * (ex.: "IRMAO_IRMA"), sempre o rótulo daqui.
 */

import type {
  DiaSemana,
  MotivoRecomendacao,
  NivelDificuldade,
  NivelDominio,
  OrigemQuestao,
  Parentesco,
  Sexo,
  StatusAtivoInativo,
  StatusMatricula,
  StatusPlano,
  StatusQuestao,
  StatusSimulado,
  StatusSimuladoAluno,
  StatusSimuladoQuestao,
  StatusTurma,
  TipoDestinacaoSimulado,
  TipoQuestao,
  TipoUsuario,
} from '../types'
import type { TagVariant } from '../components/ui/Tag/types'

export type { TagVariant }

function opcoes<T extends string>(mapa: Record<T, string>) {
  return (Object.keys(mapa) as T[]).map((value) => ({ value, label: mapa[value] }))
}

// --- Usuário / cadastro ----------------------------------------------------

export const ROTULO_TIPO_USUARIO: Record<TipoUsuario, string> = {
  ADMINISTRADOR: 'Administrador',
  PROFESSOR: 'Professor',
  ALUNO: 'Aluno',
}

export const ROTULO_SEXO: Record<Sexo, string> = {
  FEMININO: 'Feminino',
  MASCULINO: 'Masculino',
}

export const ROTULO_PARENTESCO: Record<Parentesco, string> = {
  PAI: 'Pai',
  MAE: 'Mãe',
  AVO: 'Avô',
  AVOA: 'Avó',
  TIO: 'Tio',
  TIA: 'Tia',
  IRMAO_IRMA: 'Irmão / Irmã',
  TUTOR_LEGAL: 'Tutor legal',
  OUTRO: 'Outro',
}

// --- Status ----------------------------------------------------------------

export const ROTULO_ATIVO_INATIVO: Record<StatusAtivoInativo, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
}

/** Variante feminina (Turma, Disciplina) — mesmo enum, concordância de gênero diferente. */
export const ROTULO_ATIVA_INATIVA: Record<StatusAtivoInativo, string> = {
  ATIVO: 'Ativa',
  INATIVO: 'Inativa',
}

/** Plano de Ensino/Plano de Aula: não "inativa", conclui o ciclo (matrícula cíclica). */
export const ROTULO_STATUS_PLANO: Record<StatusPlano, string> = {
  ATIVO: 'Ativo',
  CONCLUIDO: 'Concluído',
}

export const STATUS_PLANO_VARIANT: Record<StatusPlano, TagVariant> = {
  ATIVO: 'success',
  CONCLUIDO: 'neutral',
}

export const ROTULO_STATUS_TURMA: Record<StatusTurma, string> = {
  ATIVA: 'Ativa',
  INATIVA: 'Inativa',
}

export const ROTULO_STATUS_MATRICULA: Record<StatusMatricula, string> = {
  ATIVA: 'Ativa',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  TRANSFERIDA: 'Transferida',
}

export const ROTULO_STATUS_QUESTAO: Record<StatusQuestao, string> = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
}

export const ROTULO_STATUS_SIMULADO: Record<StatusSimulado, string> = {
  RASCUNHO: 'Rascunho',
  PUBLICADO: 'Publicado',
  ENCERRADO: 'Encerrado',
}

export const ROTULO_STATUS_SIMULADO_ALUNO: Record<StatusSimuladoAluno, string> = {
  PENDENTE: 'Pendente',
  CONCLUIDO: 'Concluído',
}

export const ROTULO_STATUS_SIMULADO_QUESTAO: Record<StatusSimuladoQuestao, string> = {
  ATIVA: 'Ativa',
  REMOVIDA: 'Removida',
}

// --- Simulado / questão ----------------------------------------------------

export const ROTULO_TIPO_QUESTAO: Record<TipoQuestao, string> = {
  ALTERNATIVAS: 'Alternativas',
  VERDADEIRO_FALSO: 'Verdadeiro / Falso',
}

export const ROTULO_NIVEL_DIFICULDADE: Record<NivelDificuldade, string> = {
  FACIL: 'Fácil',
  MEDIA: 'Média',
  DIFICIL: 'Difícil',
}

export const ROTULO_ORIGEM_QUESTAO: Record<OrigemQuestao, string> = {
  PROFESSOR: 'Professor',
  IA: 'Gerada por IA',
}

export const ROTULO_DESTINACAO: Record<TipoDestinacaoSimulado, string> = {
  TODOS: 'Toda a turma',
  ESPECIFICO: 'Alunos específicos',
}

// --- Agenda / IA -----------------------------------------------------------

export const ROTULO_DIA_SEMANA: Record<DiaSemana, string> = {
  SEGUNDA: 'Segunda-feira',
  TERCA: 'Terça-feira',
  QUARTA: 'Quarta-feira',
  QUINTA: 'Quinta-feira',
  SEXTA: 'Sexta-feira',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
}

export const ROTULO_DIA_SEMANA_CURTO: Record<DiaSemana, string> = {
  SEGUNDA: 'Seg',
  TERCA: 'Ter',
  QUARTA: 'Qua',
  QUINTA: 'Qui',
  SEXTA: 'Sex',
  SABADO: 'Sáb',
  DOMINGO: 'Dom',
}

export const ROTULO_NIVEL_DOMINIO: Record<NivelDominio, string> = {
  BAIXO: 'Domínio baixo',
  MEDIO: 'Domínio médio',
  ALTO: 'Domínio alto',
}

export const ROTULO_MOTIVO_RECOMENDACAO: Record<MotivoRecomendacao, string> = {
  REPETICAO_ESPACADA: 'Repetição espaçada',
  BAIXO_APROVEITAMENTO: 'Baixo aproveitamento',
}

// --- Cor semântica por status ---------------------------------------------

export const STATUS_MATRICULA_VARIANT: Record<StatusMatricula, TagVariant> = {
  ATIVA: 'success',
  CONCLUIDA: 'info',
  CANCELADA: 'error',
  TRANSFERIDA: 'warning',
}

export const STATUS_QUESTAO_VARIANT: Record<StatusQuestao, TagVariant> = {
  PENDENTE: 'warning',
  APROVADA: 'success',
  REJEITADA: 'error',
}

export const STATUS_SIMULADO_VARIANT: Record<StatusSimulado, TagVariant> = {
  RASCUNHO: 'neutral',
  PUBLICADO: 'success',
  ENCERRADO: 'info',
}

export const STATUS_SIMULADO_ALUNO_VARIANT: Record<StatusSimuladoAluno, TagVariant> = {
  PENDENTE: 'warning',
  CONCLUIDO: 'success',
}

export const ATIVO_INATIVO_VARIANT: Record<StatusAtivoInativo, TagVariant> = {
  ATIVO: 'success',
  INATIVO: 'neutral',
}

export const NIVEL_DIFICULDADE_VARIANT: Record<NivelDificuldade, TagVariant> = {
  FACIL: 'success',
  MEDIA: 'warning',
  DIFICIL: 'error',
}

export const NIVEL_DOMINIO_VARIANT: Record<NivelDominio, TagVariant> = {
  BAIXO: 'error',
  MEDIO: 'warning',
  ALTO: 'success',
}

// --- Listas prontas para <Select /> ---------------------------------------

export const OPCOES_SEXO = opcoes(ROTULO_SEXO)
export const OPCOES_PARENTESCO = opcoes(ROTULO_PARENTESCO)
export const OPCOES_ATIVO_INATIVO = opcoes(ROTULO_ATIVO_INATIVO)
export const OPCOES_ATIVA_INATIVA = opcoes(ROTULO_ATIVA_INATIVA)
export const OPCOES_STATUS_PLANO = opcoes(ROTULO_STATUS_PLANO)
export const OPCOES_STATUS_TURMA = opcoes(ROTULO_STATUS_TURMA)
export const OPCOES_STATUS_MATRICULA = opcoes(ROTULO_STATUS_MATRICULA)
export const OPCOES_TIPO_QUESTAO = opcoes(ROTULO_TIPO_QUESTAO)
export const OPCOES_NIVEL_DIFICULDADE = opcoes(ROTULO_NIVEL_DIFICULDADE)
export const OPCOES_DESTINACAO = opcoes(ROTULO_DESTINACAO)
export const OPCOES_DIA_SEMANA = opcoes(ROTULO_DIA_SEMANA)
export const OPCOES_NIVEL_DOMINIO = opcoes(ROTULO_NIVEL_DOMINIO)
export const OPCOES_TIPO_USUARIO = opcoes(ROTULO_TIPO_USUARIO)

// --- Endereço ----------------------------------------------------------------

/** As 27 UFs do Brasil, para o Select do bloco de Endereço (item 9.8). */
export const OPCOES_UF = [
  { value: 'AC', label: 'AC' },
  { value: 'AL', label: 'AL' },
  { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' },
  { value: 'BA', label: 'BA' },
  { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' },
  { value: 'ES', label: 'ES' },
  { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' },
  { value: 'MT', label: 'MT' },
  { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' },
  { value: 'PA', label: 'PA' },
  { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' },
  { value: 'PE', label: 'PE' },
  { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' },
  { value: 'RN', label: 'RN' },
  { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' },
  { value: 'RR', label: 'RR' },
  { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' },
  { value: 'SE', label: 'SE' },
  { value: 'TO', label: 'TO' },
]

// --- LGPD / consentimento -----------------------------------------------------

/** Texto curto exibido junto ao checkbox de aceite (item 10.3 — sem versionamento formal). */
export const TEXTO_VERSAO_LGPD =
  'Autorizo o uso dos dados do aluno na plataforma StudoJurata, conforme a Lei Geral de Proteção de Dados (LGPD).'
