import { describe, expect, it } from 'vitest'

import { questoesPendentesDoSimulado } from './aprovacaoDeQuestoes'
import type { AlternativaResponse, QuestaoResponse, SimuladoQuestaoResponse } from '@/types/simulados'

const vinculos = [
  { id: 1, simuladoId: 5, questaoId: 20 },
  { id: 2, simuladoId: 5, questaoId: 10 },
  { id: 3, simuladoId: 5, questaoId: 11 },
  { id: 4, simuladoId: 6, questaoId: 12 },
] as SimuladoQuestaoResponse[]

const banco = [
  { id: 20, enunciado: 'B', tipo: 'ALTERNATIVAS', status: 'PENDENTE' },
  { id: 10, enunciado: 'A', tipo: 'ALTERNATIVAS', status: 'PENDENTE' },
  { id: 11, enunciado: 'C', tipo: 'ALTERNATIVAS', status: 'APROVADA' },
  { id: 12, enunciado: 'D', tipo: 'ALTERNATIVAS', status: 'PENDENTE' },
] as QuestaoResponse[]

const alternativas = [
  { id: 2, questaoId: 10, texto: 'segunda', correta: false, ordem: 2 },
  { id: 1, questaoId: 10, texto: 'primeira', correta: true, ordem: 1 },
] as AlternativaResponse[]

describe('questoesPendentesDoSimulado', () => {
  it('traz só as pendentes deste simulado, por id', () => {
    expect(questoesPendentesDoSimulado(vinculos, banco, alternativas, 5).map((item) => item.id)).toEqual([10, 20])
  })

  it('ordena as alternativas pela ordem', () => {
    const [primeira] = questoesPendentesDoSimulado(vinculos, banco, alternativas, 5)

    expect(primeira.alternativas.map((item) => item.texto)).toEqual(['primeira', 'segunda'])
    expect(primeira.alternativas[0].correta).toBe(true)
  })
})
