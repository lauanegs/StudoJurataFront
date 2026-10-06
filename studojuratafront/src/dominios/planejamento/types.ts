
import type { EntidadeBase, StatusAtivoInativo } from '@/dominios/comum/types'
import type { Curso } from '@/dominios/curriculo/types'
import type { Aluno, Professor } from '@/dominios/pessoas/types'
import type { HorarioTurma, TurmaDisciplina } from '@/dominios/turmas/types'

export type StatusPlano = 'ATIVO' | 'CONCLUIDO'

export interface PlanoEnsino extends EntidadeBase {
  turmaDisciplina?: TurmaDisciplina | null
  professor?: Professor | null
  curso: Curso
  cargaHoraria?: number
  ementa?: string
  objetivoGeral?: string
  metodologia?: string
  dataInicio?: string
  dataFim?: string
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
  horarioTurma?: HorarioTurma | null
  cargaHoraria?: number
  dataPrevista?: string
  ordem?: number
  titulo?: string
  dataPublicacao?: string
  observacoes?: string
  status?: StatusAtivoInativo
}

export interface GerarAulasLoteRequest {
  quantidade: number
  dataInicio?: string
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

export interface ChamadaRequest {
  alunos: {
    alunoId: number
    presente: boolean
    justificativa?: string
  }[]
}

export interface EstatisticasPlanoAula {
  [chave: string]: number | string | null
}

export interface DadosConteudo {
  ordem: string
  titulo: string
  descricao: string
}

export interface DadosAula {
  ordem: string
  titulo: string
  dataPrevista: string
  dataPublicacao: string
  horarioTurmaId: number | null
  cargaHorariaManual: string
  observacoes: string
}

export interface ContextoAula {
  semHorarioCadastrado: boolean
  ordensOcupadas: number[]
  ordemSugerida: string
}

export interface DadosPlanoEnsino {
  cursoId: number | null
  turmaId: number | null
  disciplinaId: number | null
  cargaHoraria: string
  dataInicio: string
  dataFim: string
  ementa: string
  objetivoGeral: string
  metodologia: string
  status: StatusPlano
}
