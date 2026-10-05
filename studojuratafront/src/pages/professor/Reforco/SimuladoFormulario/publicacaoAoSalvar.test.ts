import { describe, expect, it } from 'vitest'

import { planejarPublicacao } from './publicacaoAoSalvar'

const AGORA = new Date('2026-10-05T12:00:00').getTime()
const passado = '2026-10-05T08:00'
const futuro = '2026-10-06T08:00'

describe('planejarPublicacao', () => {
  it('turma toda com início já chegado: lança agora', () => {
    expect(planejarPublicacao({ tipoDestinacao: 'TODOS', quantidadeAlunosEscolhidos: 0, dataInicio: passado, agora: AGORA })).toEqual({
      acao: 'lancar-agora',
      inicioJaChegou: true,
    })
  })

  it('turma toda com início futuro: o sistema publica sozinho na data', () => {
    expect(planejarPublicacao({ tipoDestinacao: 'TODOS', quantidadeAlunosEscolhidos: 0, dataInicio: futuro, agora: AGORA })).toEqual({
      acao: 'publicacao-automatica',
      inicioJaChegou: false,
    })
  })

  it('alunos específicos escolhidos: lança já, mesmo com início futuro', () => {
    expect(
      planejarPublicacao({ tipoDestinacao: 'ESPECIFICO', quantidadeAlunosEscolhidos: 2, dataInicio: futuro, agora: AGORA }).acao,
    ).toBe('lancar-agora')
  })

  it('alunos específicos sem ninguém escolhido: continua rascunho', () => {
    expect(
      planejarPublicacao({ tipoDestinacao: 'ESPECIFICO', quantidadeAlunosEscolhidos: 0, dataInicio: passado, agora: AGORA }).acao,
    ).toBe('rascunho')
  })

  it('janela já terminada nunca lança nem agenda', () => {
    const janelaVencida = { dataInicio: '2026-10-01T08:00', dataFim: '2026-10-02T08:00', agora: AGORA }

    expect(planejarPublicacao({ tipoDestinacao: 'TODOS', quantidadeAlunosEscolhidos: 0, ...janelaVencida }).acao).toBe('rascunho')
    expect(planejarPublicacao({ tipoDestinacao: 'ESPECIFICO', quantidadeAlunosEscolhidos: 3, ...janelaVencida }).acao).toBe('rascunho')
  })
})
