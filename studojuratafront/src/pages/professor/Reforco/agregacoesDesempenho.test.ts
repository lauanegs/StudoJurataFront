import { describe, expect, it } from 'vitest'

import { agruparPorSimulado, mediaPorDisciplina, tendenciaPorDisciplina } from './agregacoesDesempenho'
import type { TentativaDesempenho } from '../../../types/simulados'

function tentativa(dados: Partial<TentativaDesempenho>): TentativaDesempenho {
  return {
    id: 1,
    alunoId: 1,
    simuladoId: 1,
    simuladoTitulo: 'Simulado 1',
    turmaId: 135,
    turma: 'Geek Júnior',
    disciplinaId: 87,
    disciplina: 'Robótica',
    nota: 8,
    notaMaxima: 10,
    percentual: 80,
    data: '2026-08-20T08:00:00',
    tipoDestinacao: 'TODOS',
    ...dados,
  }
}

describe('agruparPorSimulado', () => {
  it('calcula a nota média de cada simulado sobre a nota máxima', () => {
    const desempenhos = agruparPorSimulado([
      tentativa({ id: 1, nota: 8 }),
      tentativa({ id: 2, nota: 6 }),
      tentativa({ id: 3, simuladoId: 2, simuladoTitulo: 'Simulado 2', nota: 15, notaMaxima: 20 }),
    ])

    expect(desempenhos).toHaveLength(2)
    expect(desempenhos[0]).toMatchObject({ simuladoId: 1, percentual: 70, tentativas: 2, turma: 'Geek Júnior' })
    expect(desempenhos[1]).toMatchObject({ simuladoId: 2, percentual: 75, tentativas: 1 })
  })

  it('limita a 100% e usa rótulos padrão sem turma ou disciplina', () => {
    const [desempenho] = agruparPorSimulado([tentativa({ nota: 12, turma: null, disciplina: null })])

    expect(desempenho.percentual).toBe(100)
    expect(desempenho.turma).toBe('Sem turma')
    expect(desempenho.disciplina).toBe('Sem disciplina')
  })
})

describe('mediaPorDisciplina', () => {
  it('faz a média dos simulados de cada disciplina, do pior para o melhor', () => {
    const desempenhos = agruparPorSimulado([
      tentativa({ simuladoId: 1, nota: 9 }),
      tentativa({ simuladoId: 2, nota: 7 }),
      tentativa({ simuladoId: 3, disciplina: 'Programação', nota: 5 }),
    ])

    expect(mediaPorDisciplina(desempenhos)).toEqual([
      { chave: 'Programação', rotulo: 'Programação', valor: 50 },
      { chave: 'Robótica', rotulo: 'Robótica', valor: 80 },
    ])
  })
})

describe('tendenciaPorDisciplina', () => {
  it('ordena por data e ignora disciplinas com um simulado só', () => {
    const desempenhos = agruparPorSimulado([
      tentativa({ simuladoId: 2, nota: 9, data: '2026-09-10T08:00:00' }),
      tentativa({ simuladoId: 1, nota: 6, data: '2026-08-20T08:00:00' }),
      tentativa({ simuladoId: 3, disciplina: 'Programação', nota: 5 }),
    ])

    expect(tendenciaPorDisciplina(desempenhos)).toEqual([
      {
        disciplina: 'Robótica',
        pontos: [
          { chave: '1', rotulo: '20/08/2026', valor: 60 },
          { chave: '2', rotulo: '10/09/2026', valor: 90 },
        ],
      },
    ])
  })
})
