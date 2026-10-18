import { createContext, useContext } from 'react'

import type { ContextoCursoAluno } from './types'

export const CursoAlunoContexto = createContext<ContextoCursoAluno | null>(null)

export function useCursoAlunoContext() {
  const contexto = useContext(CursoAlunoContexto)

  if (!contexto) {
    throw new Error('useCursoAluno precisa estar dentro de <CursoAlunoProvider />')
  }

  return contexto
}
