import type { AlunoTurma } from '@/dominios/turmas/types'

export interface RequestState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface RequestResult<T> extends RequestState<T> {
  reload: () => Promise<void>
  setData: (updater: T | ((previous: T | null) => T | null)) => void
  isEmpty: boolean
}

export type TipoFiltro = 'disciplina' | 'aluno'

export interface FiltroAplicado {
  turmaId: number
  tipo: TipoFiltro
  especificoId: number
}

export interface OpcoesFiltroTurma {
  apenasAtivos?: boolean
  buscarMatriculas?: (turmaId: number) => Promise<AlunoTurma[]>
  dependenciasMatriculas?: unknown[]
}
