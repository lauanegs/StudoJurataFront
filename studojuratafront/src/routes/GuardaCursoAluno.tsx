import { Navigate } from 'react-router-dom'

import { CarregandoTela } from '@/components/feedback/CarregandoTela'
import { useCursoAluno } from '@/hooks/useCursoAluno'

/** Aluno com mais de um curso precisa escolher qual abrir antes de usar o portal */
export function GuardaCursoAluno({ children }: { children: React.ReactNode }) {
  const { loading, precisaEscolher } = useCursoAluno()

  if (loading) return <CarregandoTela />
  if (precisaEscolher) return <Navigate to="/aluno/curso" replace />

  return <>{children}</>
}
