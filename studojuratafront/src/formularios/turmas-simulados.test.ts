import { describe, expect, it } from 'vitest'

import { dataFimSimuladoValida, simuladoSchema } from './simulados'
import { turmaSchema } from './turmas'
import { errosDoSchema } from './errosDoSchema.test-utils'

describe('turmaSchema', () => {
  const valida = { titulo: 'Geek Júnior', cursoId: 1, capacidadeMaxima: '', dataInicio: '', dataFim: '', ativa: true }

  it('exige nome e curso', async () => {
    expect(await errosDoSchema(turmaSchema, { ...valida, titulo: '  ', cursoId: null })).toEqual({
      titulo: 'Informe o nome da turma',
      cursoId: 'Selecione o curso',
    })
  })

  it('exige capacidade inteira e positiva quando preenchida', async () => {
    const mensagem = { capacidadeMaxima: 'Informe um número inteiro maior que zero' }
    expect(await errosDoSchema(turmaSchema, { ...valida, capacidadeMaxima: '2.5' })).toEqual(mensagem)
    expect(await errosDoSchema(turmaSchema, { ...valida, capacidadeMaxima: '0' })).toEqual(mensagem)
    expect(await errosDoSchema(turmaSchema, { ...valida, capacidadeMaxima: '20' })).toEqual({})
  })

  it('aceita data final igual à inicial, mas não anterior', async () => {
    expect(await errosDoSchema(turmaSchema, { ...valida, dataInicio: '2026-02-02', dataFim: '2026-02-02' })).toEqual({})
    expect(await errosDoSchema(turmaSchema, { ...valida, dataInicio: '2026-02-02', dataFim: '2026-02-01' })).toEqual({
      dataFim: 'A data final deve ser posterior à data inicial',
    })
  })
})

describe('simuladoSchema', () => {
  const valido = {
    titulo: 'Reforço de frações',
    disciplinaId: null,
    turmaId: null,
    planoEnsinoId: null,
    tipoDestinacao: 'TODOS',
    dataInicio: '',
    dataFim: '',
    tempoLimite: '',
    notaMaxima: '10',
  }

  it('aceita o mínimo: título com destinação para todos', async () => {
    expect(await errosDoSchema(simuladoSchema, valido)).toEqual({})
  })

  it('exige turma só quando a destinação é específica', async () => {
    expect(await errosDoSchema(simuladoSchema, { ...valido, tipoDestinacao: 'ESPECIFICO' })).toEqual({
      turmaId: 'Selecione a turma para escolher os alunos',
    })
    expect(await errosDoSchema(simuladoSchema, { ...valido, tipoDestinacao: 'ESPECIFICO', turmaId: 135 })).toEqual({})
  })

  it('rejeita título vazio, tempo fracionado e nota zero', async () => {
    expect(await errosDoSchema(simuladoSchema, { ...valido, titulo: '', tempoLimite: '2.5', notaMaxima: '0' })).toEqual({
      titulo: 'Informe o título do simulado',
      tempoLimite: 'Informe os minutos como número inteiro positivo',
      notaMaxima: 'A nota máxima deve ser maior que zero',
    })
  })

  it('exige data final estritamente posterior à inicial', async () => {
    const mesmoInstante = { ...valido, dataInicio: '2026-08-20T08:00', dataFim: '2026-08-20T08:00' }
    expect(await errosDoSchema(simuladoSchema, mesmoInstante)).toEqual({
      dataFim: 'A data final deve ser posterior à inicial',
    })
  })
})

describe('dataFimSimuladoValida', () => {
  it('só invalida quando as duas datas existem e a final não é posterior', () => {
    expect(dataFimSimuladoValida('', '2026-01-01T00:00')).toBe(true)
    expect(dataFimSimuladoValida('2026-01-01T10:00', '2026-01-01T10:01')).toBe(true)
    expect(dataFimSimuladoValida('2026-01-01T10:00', '2026-01-01T09:59')).toBe(false)
  })
})
