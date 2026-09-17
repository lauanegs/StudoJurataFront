import { describe, expect, it } from 'vitest'

import { carregarQuestao, copiarQuestao } from './questoes'
import type { AlternativaResponse, QuestaoResponse } from '../../../../types/simulados'

const questao = {
  id: 10,
  enunciado: 'O que é um algoritmo?',
  tipo: 'MULTIPLA_ESCOLHA',
  disciplinaId: null,
  nivelDificuldade: null,
  status: 'APROVADA',
} as unknown as QuestaoResponse

const alternativas = [
  { id: 2, questaoId: 10, texto: 'Uma sequência de passos', correta: true, ordem: 2 },
  { id: 1, questaoId: 10, texto: 'Um robô', correta: false, ordem: 1 },
  { id: 3, questaoId: 99, texto: 'De outra questão', correta: false, ordem: 1 },
] as AlternativaResponse[]

describe('copiarQuestao', () => {
  it('copia sem ids, na ordem, usando a disciplina e o nível padrão', () => {
    expect(copiarQuestao(questao, alternativas, 87)).toEqual({
      enunciado: 'O que é um algoritmo?',
      tipo: 'MULTIPLA_ESCOLHA',
      disciplinaId: 87,
      nivelDificuldade: 'MEDIA',
      alternativas: [
        { texto: 'Um robô', correta: false },
        { texto: 'Uma sequência de passos', correta: true },
      ],
    })
  })

  it('usa alternativas em branco quando a original tem menos de duas', () => {
    const copia = copiarQuestao(questao, alternativas.slice(0, 1), null)
    expect(copia.alternativas.length).toBeGreaterThanOrEqual(2)
    expect(copia.alternativas.every((alternativa) => alternativa.texto === '')).toBe(true)
  })
})

describe('carregarQuestao', () => {
  it('mantém os ids da questão e das alternativas', () => {
    const carregada = carregarQuestao(questao, alternativas)

    expect(carregada.id).toBe(10)
    expect(carregada.status).toBe('APROVADA')
    expect(carregada.alternativas.map((alternativa) => alternativa.id)).toEqual([1, 2])
  })
})
