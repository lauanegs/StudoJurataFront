import { describe, expect, it } from 'vitest'

import { dataFimSimuladoValida, simuladoSchema } from './simulados'
import { horarioTurmaSchema, turmaSchema, vinculoTurmaSchema } from './turmas'
import { errosDoSchema } from './errosDoSchema.test-utils'

describe('turmaSchema', () => {
  const valida = {
    titulo: 'Geek Júnior',
    cursoId: 1,
    capacidadeMaxima: '20',
    dataInicio: '2026-02-02',
    dataFim: '',
    ativa: true,
  }

  it('exige nome e curso', async () => {
    expect(await errosDoSchema(turmaSchema, { ...valida, titulo: '  ', cursoId: null })).toEqual({
      titulo: 'Informe o nome da turma',
      cursoId: 'Selecione o curso',
    })
  })

  it('exige capacidade máxima (não aceita vazio)', async () => {
    expect(await errosDoSchema(turmaSchema, { ...valida, capacidadeMaxima: '' })).toEqual({
      capacidadeMaxima: 'Informe a capacidade máxima',
    })
  })

  it('exige capacidade inteira e positiva', async () => {
    const mensagem = { capacidadeMaxima: 'Informe um número inteiro maior que zero' }
    expect(await errosDoSchema(turmaSchema, { ...valida, capacidadeMaxima: '2.5' })).toEqual(mensagem)
    expect(await errosDoSchema(turmaSchema, { ...valida, capacidadeMaxima: '0' })).toEqual(mensagem)
    expect(await errosDoSchema(turmaSchema, { ...valida, capacidadeMaxima: '20' })).toEqual({})
  })

  it('exige data de início (não aceita vazio)', async () => {
    expect(await errosDoSchema(turmaSchema, { ...valida, dataInicio: '' })).toEqual({
      dataInicio: 'Informe a data de início',
    })
  })

  it('aceita data final igual à inicial, mas não anterior', async () => {
    expect(await errosDoSchema(turmaSchema, { ...valida, dataInicio: '2026-02-02', dataFim: '2026-02-02' })).toEqual({})
    expect(await errosDoSchema(turmaSchema, { ...valida, dataInicio: '2026-02-02', dataFim: '2026-02-01' })).toEqual({
      dataFim: 'A data final deve ser posterior à data inicial',
    })
  })
})

describe('horarioTurmaSchema', () => {
  const valido = { diaSemana: 'SEGUNDA' as const, horaInicio: '08:00', horaFim: '09:30' }

  it('exige dia, início e término', async () => {
    expect(await errosDoSchema(horarioTurmaSchema, { diaSemana: null, horaInicio: '', horaFim: '' })).toEqual({
      diaSemana: 'Selecione o dia da semana',
      horaInicio: 'Informe a hora de início',
      horaFim: 'Informe a hora de término',
    })
  })

  it('exige término maior que o início', async () => {
    expect(await errosDoSchema(horarioTurmaSchema, { ...valido, horaFim: '08:00' })).toEqual({
      horaFim: 'A hora de término deve ser maior que a de início',
    })
    expect(await errosDoSchema(horarioTurmaSchema, valido)).toEqual({})
  })
})

describe('vinculoTurmaSchema', () => {
  it('exige a disciplina e deixa o professor como opcional', async () => {
    expect(await errosDoSchema(vinculoTurmaSchema, { disciplinaId: null, professorId: null })).toEqual({
      disciplinaId: 'Selecione a disciplina',
    })
    expect(await errosDoSchema(vinculoTurmaSchema, { disciplinaId: 3, professorId: null })).toEqual({})
    expect(await errosDoSchema(vinculoTurmaSchema, { disciplinaId: 3, professorId: 9 })).toEqual({})
  })
})

describe('simuladoSchema', () => {
  const valido = {
    titulo: 'Reforço de frações',
    disciplinaId: 5,
    turmaId: 135,
    planoEnsinoId: 77,
    tipoDestinacao: 'TODOS',
    dataInicio: '2026-08-20T08:00',
    dataFim: '',
    tempoLimite: '',
    notaMaxima: '10',
  }

  it('aceita o mínimo: título, disciplina, turma e plano', async () => {
    expect(await errosDoSchema(simuladoSchema, valido)).toEqual({})
  })

  it('exige plano de ensino (o back recusa simulado de professor sem plano)', async () => {
    expect(await errosDoSchema(simuladoSchema, { ...valido, planoEnsinoId: null })).toEqual({
      planoEnsinoId: 'Selecione o plano de ensino',
    })
  })

  it('exige data de início (o back recusa simulado sem janela de aplicação)', async () => {
    expect(await errosDoSchema(simuladoSchema, { ...valido, dataInicio: '' })).toEqual({
      dataInicio: 'Informe a data de início',
    })
  })

  it('exige disciplina e turma sempre (o back recusa simulado de professor sem escopo)', async () => {
    expect(await errosDoSchema(simuladoSchema, { ...valido, disciplinaId: null, turmaId: null })).toEqual({
      disciplinaId: 'Selecione a disciplina',
      turmaId: 'Selecione a turma',
    })
  })

  it('mantém a mensagem de turma específica para a destinação ESPECIFICO', async () => {
    expect(await errosDoSchema(simuladoSchema, { ...valido, tipoDestinacao: 'ESPECIFICO', turmaId: null })).toEqual({
      turmaId: 'Selecione a turma para escolher os alunos',
    })
    expect(await errosDoSchema(simuladoSchema, { ...valido, tipoDestinacao: 'ESPECIFICO' })).toEqual({})
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
