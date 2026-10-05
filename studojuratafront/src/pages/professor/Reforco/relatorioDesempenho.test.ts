import { describe, expect, it } from 'vitest'

import type { DesempenhoSimulado } from './agregacoesDesempenho'
import { montarSecoesRelatorio } from './relatorioDesempenho'

const simulado = { simuladoId: 3, titulo: 'Prova 1', turma: 'T1', disciplina: 'Mat', percentual: 80 } as DesempenhoSimulado

describe('montarSecoesRelatorio', () => {
  it('gera resumo, distribuição, média, uma evolução por disciplina e a lista de simulados, nessa ordem', () => {
    const secoes = montarSecoesRelatorio({
      desempenhos: [simulado],
      totalTentativasConcluidas: 5,
      totalAlunosAvaliados: 4,
      totalDisciplinasAvaliadas: 1,
      tabelaDistribuicaoGeral: [],
      tabelaDesempenhoPorDisciplina: [],
      tendenciaPorDisciplina: [{ disciplina: 'Mat', pontos: [{ chave: 'a', rotulo: 'Prova 1', valor: 80 }] }],
    })

    expect(secoes.map((secao) => secao.titulo)).toEqual([
      'Resumo geral',
      'Distribuição geral das notas',
      'Desempenho médio por disciplina',
      'Evolução — Mat',
      'Desempenho por simulado',
    ])
    expect(secoes[0].linhas.map((linha) => linha.valor)).toEqual(['1', '5', '4', '1'])
    expect(secoes[4].linhas[0].rotulo).toBe('Prova 1 — T1 — Mat')
  })
})
