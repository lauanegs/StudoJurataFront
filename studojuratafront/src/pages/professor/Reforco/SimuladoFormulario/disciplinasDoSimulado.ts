import type { TurmaDisciplina } from '@/dominios/turmas/types'

import type { OpcaoDisciplina } from './types'
/** Disciplinas que o professor pode escolher no simulado */
export function disciplinasDaTurma(
  vinculos: TurmaDisciplina[],
  turmaId: number | null,
): OpcaoDisciplina[] {
  if (!turmaId) {
    return []
  }

  const opcoes = new Map<number, string>()

  for (const vinculo of vinculos) {
    if (vinculo.turma?.id !== turmaId || !vinculo.disciplina?.id) continue
    if (vinculo.status === 'INATIVO' || vinculo.disciplina.status === 'INATIVO') continue

    const disciplina = vinculo.disciplina
    opcoes.set(disciplina.id, disciplina.titulo ?? `Disciplina ${disciplina.id}`)
  }

  return [...opcoes.entries()].map(([value, label]) => ({ value, label }))
}

/** A disciplina escolhida continua válida para a turma informada? */
export function disciplinaCompativelComTurma(
  vinculos: TurmaDisciplina[],
  turmaId: number | null,
  disciplinaId: number | null,
): boolean {
  if (disciplinaId == null) {
    return true
  }
  return disciplinasDaTurma(vinculos, turmaId).some((opcao) => opcao.value === disciplinaId)
}
