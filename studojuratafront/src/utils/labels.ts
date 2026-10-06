import type { StatusAtivoInativo, TipoUsuario } from '@/dominios/comum/types'
import type { MotivoRecomendacao } from '@/dominios/ia/types'
import type { Parentesco, Sexo } from '@/dominios/pessoas/types'
import type { StatusPlano } from '@/dominios/planejamento/types'
import type {
  NivelDificuldade,
  OrigemQuestao,
  StatusQuestao,
  StatusSimulado,
  TipoDestinacaoSimulado,
  TipoQuestao,
} from '@/dominios/simulados/types'
import type { DiaSemana, StatusMatricula, StatusTurma } from '@/dominios/turmas/types'
import type { TagVariant } from '@/components/ui/Tag/types'

export type { TagVariant }

function opcoes<T extends string>(mapa: Record<T, string>) {
  return (Object.keys(mapa) as T[]).map((value) => ({ value, label: mapa[value] }))
}

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

export const ROTULO_ATIVO_INATIVO: Record<StatusAtivoInativo, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
}

export const ROTULO_ATIVA_INATIVA: Record<StatusAtivoInativo, string> = {
  ATIVO: 'Ativa',
  INATIVO: 'Inativa',
}

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

export const ROTULO_MOTIVO_RECOMENDACAO: Record<MotivoRecomendacao, string> = {
  REPETICAO_ESPACADA: 'Repetição espaçada',
  BAIXO_APROVEITAMENTO: 'Baixo aproveitamento',
}

export const STATUS_MATRICULA_VARIANT: Record<StatusMatricula, TagVariant> = {
  ATIVA: 'success',
  CONCLUIDA: 'info',
  CANCELADA: 'error',
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

export const ATIVO_INATIVO_VARIANT: Record<StatusAtivoInativo, TagVariant> = {
  ATIVO: 'success',
  INATIVO: 'neutral',
}

export const NIVEL_DIFICULDADE_VARIANT: Record<NivelDificuldade, TagVariant> = {
  FACIL: 'success',
  MEDIA: 'warning',
  DIFICIL: 'error',
}

export const OPCOES_SEXO = opcoes(ROTULO_SEXO)
export const OPCOES_PARENTESCO = opcoes(ROTULO_PARENTESCO)
export const OPCOES_ATIVO_INATIVO = opcoes(ROTULO_ATIVO_INATIVO)
export const OPCOES_ATIVA_INATIVA = opcoes(ROTULO_ATIVA_INATIVA)
export const OPCOES_STATUS_PLANO = opcoes(ROTULO_STATUS_PLANO)
export const OPCOES_NIVEL_DIFICULDADE = opcoes(ROTULO_NIVEL_DIFICULDADE)
export const OPCOES_DESTINACAO = opcoes(ROTULO_DESTINACAO)
export const OPCOES_DIA_SEMANA = opcoes(ROTULO_DIA_SEMANA)
export const OPCOES_TIPO_USUARIO = opcoes(ROTULO_TIPO_USUARIO)

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
