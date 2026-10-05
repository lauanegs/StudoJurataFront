import { describe, expect, it } from 'vitest'

import {
  carregarQuestao,
  copiarQuestao,
  MAXIMO_QUESTOES,
  planejarImportacaoDeQuestoes,
  questoesDoSimulado,
  simuladoTemQuestaoPendente,
} from './questoes'
import { questaoVazia } from '../../../../components/simulados/QuestaoEditor/types'
import type { AlternativaResponse, QuestaoResponse, SimuladoQuestaoResponse } from '../../../../types/simulados'

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

describe('questoesDoSimulado', () => {
  const vinculos = [
    { id: 1, simuladoId: 5, questaoId: 10, ordem: 2 },
    { id: 2, simuladoId: 5, questaoId: 11, ordem: 1, status: 'REMOVIDA' },
    { id: 3, simuladoId: 6, questaoId: 12, ordem: 1 },
  ] as SimuladoQuestaoResponse[]
  const banco = [questao, { ...questao, id: 11 }, { ...questao, id: 12 }] as QuestaoResponse[]

  it('traz só as questões ativas deste simulado', () => {
    expect(questoesDoSimulado(vinculos, banco, alternativas, 5).map((item) => item.id)).toEqual([10])
  })

  it('sem vínculos devolve lista vazia', () => {
    expect(questoesDoSimulado([], banco, alternativas, 5)).toEqual([])
  })
})

describe('simuladoTemQuestaoPendente', () => {
  const vinculos = [{ id: 1, simuladoId: 5, questaoId: 10 }] as SimuladoQuestaoResponse[]

  it('detecta questão ativa ainda pendente de revisão', () => {
    expect(simuladoTemQuestaoPendente(vinculos, [{ ...questao, status: 'PENDENTE' } as QuestaoResponse], 5)).toBe(true)
  })

  it('questões aprovadas ou de outro simulado não travam', () => {
    expect(simuladoTemQuestaoPendente(vinculos, [questao], 5)).toBe(false)
    expect(simuladoTemQuestaoPendente(vinculos, [{ ...questao, status: 'PENDENTE' } as QuestaoResponse], 6)).toBe(false)
  })
})

describe('planejarImportacaoDeQuestoes', () => {
  const escolhidas = (quantidade: number) =>
    Array.from({ length: quantidade }, (_, indice) => ({ ...questao, id: 100 + indice }) as QuestaoResponse)

  it('descarta a primeira questão em branco ao importar', () => {
    const resultado = planejarImportacaoDeQuestoes([questaoVazia()], escolhidas(2), alternativas, 7)

    expect(resultado.questoes).toHaveLength(2)
    expect(resultado.importadas).toBe(2)
    expect(resultado.cortadas).toBe(0)
  })

  it('acrescenta às questões já preenchidas e corta o que passa do limite', () => {
    const atuais = Array.from({ length: MAXIMO_QUESTOES - 1 }, () => ({ ...questaoVazia(), enunciado: 'x' }))
    const resultado = planejarImportacaoDeQuestoes(atuais, escolhidas(3), alternativas, 7)

    expect(resultado.questoes).toHaveLength(MAXIMO_QUESTOES)
    expect(resultado.importadas).toBe(1)
    expect(resultado.cortadas).toBe(2)
  })

  it('sem espaço devolve nulo para o formulário avisar o limite', () => {
    const cheio = Array.from({ length: MAXIMO_QUESTOES }, () => ({ ...questaoVazia(), enunciado: 'x' }))

    expect(planejarImportacaoDeQuestoes(cheio, escolhidas(1), alternativas, 7).questoes).toBeNull()
  })
})
