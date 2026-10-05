import { describe, expect, it } from 'vitest'

import { montarQuestoesDaProva, questaoAcertada, questaoRespondida } from './provaDoAluno'
import type { QuestaoDaProva } from './tipos'
import type { ProvaDaTentativa } from '@/types/simulados'

const alternativa = (id: number, correta = false) => ({ id, questaoId: 1, texto: `t${id}`, ordem: id, correta })
const alternativas: QuestaoDaProva = { questaoId: 1, enunciado: 'e', tipo: 'ALTERNATIVAS', alternativas: [alternativa(10), alternativa(11, true)] }
const vf: QuestaoDaProva = { questaoId: 2, enunciado: 'e', tipo: 'VERDADEIRO_FALSO', alternativas: [alternativa(20, true), alternativa(21, false)] }

describe('montarQuestoesDaProva', () => {
  const prova = {
    simuladoAlunoId: 1,
    status: 'PENDENTE',
    gabarito: null,
    questoes: [{ questaoId: 1, enunciado: 'e', tipo: 'ALTERNATIVAS', alternativas: [{ id: 10, texto: 'a', ordem: 1 }, { id: 11, texto: 'b', ordem: 2 }] }],
  } as unknown as ProvaDaTentativa

  it('durante a prova nenhuma alternativa chega como correta', () => {
    expect(montarQuestoesDaProva(prova, {})[0].alternativas.map((a) => a.correta)).toEqual([false, false])
  })

  it('a conferência da questão marca as corretas só dela', () => {
    const questoes = montarQuestoesDaProva(prova, { 1: { acertou: true, alternativasCorretasIds: [11] } })
    expect(questoes[0].alternativas.map((a) => a.correta)).toEqual([false, true])
  })

  it('o gabarito do servidor (tentativa concluída) marca as corretas', () => {
    const concluida = { ...prova, gabarito: { '10': true, '11': false } } as unknown as ProvaDaTentativa
    expect(montarQuestoesDaProva(concluida, {})[0].alternativas.map((a) => a.correta)).toEqual([true, false])
  })

  it('sem prova carregada devolve lista vazia', () => {
    expect(montarQuestoesDaProva(null, {})).toEqual([])
  })
})

describe('questaoRespondida', () => {
  it('alternativa única: responde quando há alternativa escolhida', () => {
    expect(questaoRespondida(alternativas, {}, {})).toBe(false)
    expect(questaoRespondida(alternativas, { 1: 10 }, {})).toBe(true)
  })

  it('V/F: só com todas as afirmações julgadas', () => {
    expect(questaoRespondida(vf, {}, { 2: { 20: true } })).toBe(false)
    expect(questaoRespondida(vf, {}, { 2: { 20: true, 21: false } })).toBe(true)
  })
})

describe('questaoAcertada', () => {
  it('alternativa única: acerta com a correta', () => {
    expect(questaoAcertada(alternativas, { 1: 11 }, {})).toBe(true)
    expect(questaoAcertada(alternativas, { 1: 10 }, {})).toBe(false)
  })

  it('V/F: uma afirmação errada derruba a questão toda', () => {
    expect(questaoAcertada(vf, {}, { 2: { 20: true, 21: false } })).toBe(true)
    expect(questaoAcertada(vf, {}, { 2: { 20: true, 21: true } })).toBe(false)
  })
})
