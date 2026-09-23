import { describe, expect, it } from 'vitest'

import { disciplinaCompativelComTurma, disciplinasDaTurma } from './disciplinasDoSimulado'
import type { TurmaDisciplina } from '../../../../types/turmas'

function vinculo(
  turmaId: number,
  disciplinaId: number,
  extras: Partial<TurmaDisciplina> = {},
): TurmaDisciplina {
  return {
    id: turmaId * 100 + disciplinaId,
    turma: { id: turmaId, titulo: `Turma ${turmaId}` },
    disciplina: { id: disciplinaId, titulo: `Disciplina ${disciplinaId}`, status: 'ATIVO' },
    status: 'ATIVO',
    ...extras,
  } as TurmaDisciplina
}

describe('disciplinasDaTurma', () => {
  it('mostra só as disciplinas ofertadas na turma escolhida', () => {
    const vinculos = [vinculo(10, 5), vinculo(10, 6), vinculo(20, 7)]

    expect(disciplinasDaTurma(vinculos, 10)).toEqual([
      { value: 5, label: 'Disciplina 5' },
      { value: 6, label: 'Disciplina 6' },
    ])
  })

  it('sem turma escolhida não oferece disciplina', () => {
    expect(disciplinasDaTurma([vinculo(10, 5)], null)).toEqual([])
  })

  it('não oferece vínculo nem disciplina inativados', () => {
    const vinculos = [
      vinculo(10, 5, { status: 'INATIVO' }),
      vinculo(10, 6, {
        disciplina: { id: 6, titulo: 'Disciplina 6', status: 'INATIVO', escola: { id: 1, nome: 'Escola' } },
      }),
      vinculo(10, 7),
    ]

    expect(disciplinasDaTurma(vinculos, 10)).toEqual([{ value: 7, label: 'Disciplina 7' }])
  })

  it('não repete disciplina ofertada em mais de um vínculo', () => {
    const vinculos = [vinculo(10, 5), vinculo(10, 5, { id: 999 })]

    expect(disciplinasDaTurma(vinculos, 10)).toEqual([{ value: 5, label: 'Disciplina 5' }])
  })
})

describe('disciplinaCompativelComTurma', () => {
  const vinculos = [vinculo(10, 5), vinculo(20, 6)]

  it('disciplina da turma é compatível', () => {
    expect(disciplinaCompativelComTurma(vinculos, 10, 5)).toBe(true)
  })

  it('disciplina de outra turma deixa de ser compatível (a tela limpa a seleção)', () => {
    expect(disciplinaCompativelComTurma(vinculos, 10, 6)).toBe(false)
  })

  it('sem disciplina escolhida não há o que limpar', () => {
    expect(disciplinaCompativelComTurma(vinculos, 10, null)).toBe(true)
  })

  it('disciplina inativada não é compatível', () => {
    const comInativa = [
      vinculo(10, 5, {
        disciplina: { id: 5, titulo: 'Disciplina 5', status: 'INATIVO', escola: { id: 1, nome: 'Escola' } },
      }),
    ]

    expect(disciplinaCompativelComTurma(comInativa, 10, 5)).toBe(false)
  })
})
