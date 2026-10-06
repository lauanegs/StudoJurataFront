import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { matriculas as servicoMatriculas } from '@/dominios/turmas/service'
import type { AlunoTurma } from '@/dominios/turmas/types'
import { chaveDoCursoEscolhido } from '@/utils/cursoEscolhido'
import { useAuth } from './useAuth'
import { useAlunoLogado } from './usePerfilLogado'
import { useRequisicao } from './useRequisicao'

function lerSelecao(chave: string): number | null {
  try {
    const valor = sessionStorage.getItem(chave)
    return valor ? Number(valor) : null
  } catch {
    return null
  }
}

const ouvintes = new Set<() => void>()
const assinar = (aviso: () => void) => {
  ouvintes.add(aviso)
  return () => {
    ouvintes.delete(aviso)
  }
}

export function useCursoAluno() {
  const { usuario } = useAuth()
  const { alunoId, loading: carregandoAluno } = useAlunoLogado()
  const chave = chaveDoCursoEscolhido(usuario?.pessoaId ?? undefined)
  const escolhida = useSyncExternalStore(assinar, () => lerSelecao(chave), () => null)

  const requisicao = useRequisicao(
    () => servicoMatriculas.porAluno(alunoId as number),
    [alunoId],
    { ativo: Boolean(alunoId) },
  )

  const matriculas = useMemo<AlunoTurma[]>(() => {
    const porTurma = new Map<number, AlunoTurma>()
    for (const matricula of requisicao.data ?? []) {
      if (matricula.status === 'CANCELADA' || !matricula.turma) continue
      const atual = porTurma.get(matricula.turma.id)
      if (!atual || (atual.status !== 'ATIVA' && matricula.status === 'ATIVA')) porTurma.set(matricula.turma.id, matricula)
    }
    return [...porTurma.values()].sort(
      (a, b) =>
        Number(b.status === 'ATIVA') - Number(a.status === 'ATIVA') ||
        (b.dataInicio ?? '').localeCompare(a.dataInicio ?? ''),
    )
  }, [requisicao.data])

  const turmaId = useMemo(() => {
    if (matriculas.length === 1) return matriculas[0].turma.id
    return matriculas.some((matricula) => matricula.turma.id === escolhida) ? escolhida : null
  }, [matriculas, escolhida])

  const selecionar = useCallback(
    (id: number) => {
      try {
        sessionStorage.setItem(chave, String(id))
      } catch {
        // sem storage a escolha vale só até recarregar
      }
      ouvintes.forEach((aviso) => aviso())
    },
    [chave],
  )

  const limparSelecao = useCallback(() => {
    try {
      sessionStorage.removeItem(chave)
    } catch {
      // nada a limpar
    }
    ouvintes.forEach((aviso) => aviso())
  }, [chave])

  return {
    matriculas,
    turmaId,
    matriculaAtual: matriculas.find((matricula) => matricula.turma.id === turmaId) ?? null,
    precisaEscolher: matriculas.length > 1 && turmaId === null,
    temVariosCursos: matriculas.length > 1,
    selecionar,
    limparSelecao,
    loading: carregandoAluno || requisicao.loading,
    error: requisicao.error,
  }
}
