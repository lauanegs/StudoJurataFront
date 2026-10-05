import type { SelectOption } from '@/components/ui/Select'
import type { FormularioTurma } from '@/formularios/turmas'

import type { HorarioTurma } from '@/types/turmas'

import type { Turma } from '@/types/turmas'

import type { RequestResult } from '@/hooks/useRequisicao'
import type { AlunoTurma, TurmaDisciplina } from '@/types/turmas'

export interface AbaAlunosProps {
  turmaId: number
  requisicaoAtivos: RequestResult<AlunoTurma[]>
  historico: AlunoTurma[]
  vinculos: TurmaDisciplina[] | null
}

export interface AbaDisciplinasProps {
  turma: Turma
  cursoId: number | null
  vinculosDaTurma: TurmaDisciplina[]
  requisicaoVinculos: RequestResult<TurmaDisciplina[]>
}

export interface AbaHistoricoProps {
  turmaId: number
  requisicaoHistorico: RequestResult<AlunoTurma[]>
}

export interface AbaHorariosProps {
  turmaId: number
  requisicaoHorarios: RequestResult<HorarioTurma[]>
}

export interface DadosTurmaProps {
  form: FormularioTurma
  salvando: boolean
  opcoesCursos: SelectOption<number>[]
  carregandoCursos: boolean
}

export type Aba = 'data' | 'horarios' | 'disciplinas' | 'alunos' | 'historico'

export type Passo = 'data' | 'horarios' | 'disciplinas'
