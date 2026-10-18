import type { ReactNode } from 'react'

import type { AlunoTurma } from '@/dominios/turmas/types'

export interface ContextoCursoAluno {
  matriculas: AlunoTurma[]
  turmaId: number | null
  matriculaAtual: AlunoTurma | null
  precisaEscolher: boolean
  temVariosCursos: boolean
  selecionar: (id: number) => void
  limparSelecao: () => void
  loading: boolean
  error: string | null
}

export interface CursoAlunoProviderProps {
  children: ReactNode
}
