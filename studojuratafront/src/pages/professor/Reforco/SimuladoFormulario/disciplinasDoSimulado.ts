import type { TurmaDisciplina } from '../../../../types/turmas'

export interface OpcaoDisciplina {
  value: number
  label: string
}

/**
 * Disciplinas que o professor pode escolher no simulado: as ofertadas na turma
 * escolhida (vínculo turma-disciplina ativo) — a mesma origem que o plano de
 * ensino usa. A lista vem dos vínculos do próprio professor
 * (`/professores/{id}/turmas`), então disciplina de outra turma ou fora do
 * escopo dele não aparece.
 *
 * <p>Vínculo ou disciplina inativados ficam de fora: o back recusa simulado novo
 * (criação e edição) com disciplina inativa, então não faz sentido oferecê-la.
 */
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
