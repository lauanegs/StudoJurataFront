import { useMemo, useState } from 'react'

import { useToast } from '@/contexts/toast/toastContexto'
import { professores } from '@/dominios/pessoas/service'
import { matriculas } from '@/dominios/turmas/service'
import { useProfessorLogado } from './usePerfilLogado'
import { useRequisicao } from './useRequisicao'
import type { FiltroAplicado, OpcoesFiltroTurma, TipoFiltro } from './types'

const OPCOES_TIPO: { value: TipoFiltro; label: string }[] = [
  { value: 'disciplina', label: 'Disciplina' },
  { value: 'aluno', label: 'Aluno' },
]

// Filtro turma -> disciplina ou aluno das telas do professor; "filtro" só muda quando o professor clica em buscar
export function useFiltroTurmaProfessor({
  apenasAtivos = false,
  buscarMatriculas = (id) => matriculas.ativosPorTurma(id),
  dependenciasMatriculas = [],
}: OpcoesFiltroTurma = {}) {
  const toast = useToast()
  const { professorId } = useProfessorLogado()

  const [turmaId, setTurmaId] = useState<number | null>(null)
  const [tipo, setTipo] = useState<TipoFiltro | null>(null)
  const [especificoId, setEspecificoId] = useState<number | null>(null)
  const [filtro, setFiltro] = useState<FiltroAplicado | null>(null)

  const requisicaoVinculos = useRequisicao(
    () => professores.turmasLecionadas(professorId as number),
    [professorId],
    { ativo: Boolean(professorId) },
  )

  const vinculos = useMemo(
    () => (requisicaoVinculos.data ?? []).filter((vinculo) => !apenasAtivos || vinculo.status !== 'INATIVO'),
    [requisicaoVinculos.data, apenasAtivos],
  )

  const opcoesTurmas = useMemo(() => {
    const unicas = new Map<number, string>()
    for (const vinculo of vinculos) {
      if (vinculo.turma) unicas.set(vinculo.turma.id, vinculo.turma.titulo)
    }
    return [...unicas.entries()].map(([value, label]) => ({ value, label }))
  }, [vinculos])

  const disciplinasDaTurma = useMemo(
    () =>
      vinculos
        .filter((vinculo) => vinculo.turma?.id === turmaId && vinculo.disciplina)
        .map((vinculo) => ({ value: vinculo.disciplina!.id, label: vinculo.disciplina?.titulo ?? '—' })),
    [vinculos, turmaId],
  )

  const requisicaoMatriculasTurma = useRequisicao(
    () => buscarMatriculas(turmaId as number),
    [turmaId, ...dependenciasMatriculas],
    { ativo: Boolean(turmaId) && tipo === 'aluno' },
  )

  const opcoesEspecifico = useMemo(() => {
    if (tipo === 'disciplina') return disciplinasDaTurma

    if (tipo === 'aluno') {
      return (requisicaoMatriculasTurma.data ?? []).map((matricula) => ({
        value: matricula.aluno.id,
        label: matricula.aluno?.pessoa?.nome ?? `Aluno ${matricula.aluno.id}`,
      }))
    }

    return []
  }, [tipo, disciplinasDaTurma, requisicaoMatriculasTurma.data])

  function buscar() {
    if (!turmaId || !tipo || !especificoId) {
      toast.warning('Selecione turma, tipo de filtro e o item específico antes de buscar.')
      return
    }

    setFiltro({ turmaId, tipo, especificoId })
  }

  function limpar() {
    setTurmaId(null)
    setTipo(null)
    setEspecificoId(null)
    setFiltro(null)
  }

  return {
    requisicaoVinculos,
    turmaId,
    setTurmaId,
    tipo,
    setTipo,
    especificoId,
    setEspecificoId,
    filtro,
    opcoesTurmas,
    opcoesTipo: OPCOES_TIPO,
    disciplinasDaTurma,
    opcoesEspecifico,
    requisicaoMatriculasTurma,
    buscar,
    limpar,
  }
}
