import { describe, expect, it, vi } from 'vitest'

import { removerQuestaoDoSimulado } from './remocaoQuestao'

describe('removerQuestaoDoSimulado', () => {
  it('desvincula no back antes de tirar da lista', async () => {
    const desvincular = vi.fn().mockResolvedValue(undefined)
    const questoes = [{ id: 11 }, { id: 22 }]

    const resultado = await removerQuestaoDoSimulado({
      questoes,
      indice: 0,
      simuladoId: 300,
      desvincular,
    })

    expect(desvincular).toHaveBeenCalledWith(300, 11)
    expect(resultado.questoes).toEqual([{ id: 22 }])
    expect(resultado.erro).toBeUndefined()
  })

  it('mantém a questão na lista quando a API falha', async () => {
    const falha = new Error('409')
    const desvincular = vi.fn().mockRejectedValue(falha)
    const questoes = [{ id: 11 }, { id: 22 }]

    const resultado = await removerQuestaoDoSimulado({
      questoes,
      indice: 0,
      simuladoId: 300,
      desvincular,
    })

    expect(resultado.questoes).toBe(questoes)
    expect(resultado.erro).toBe(falha)
  })

  it('questão nova (sem id) sai só do rascunho local, sem chamar a API', async () => {
    const desvincular = vi.fn().mockResolvedValue(undefined)
    const questoes = [{ enunciado: 'nova' }, { id: 22 }]

    const resultado = await removerQuestaoDoSimulado({
      questoes,
      indice: 0,
      simuladoId: 300,
      desvincular,
    })

    expect(desvincular).not.toHaveBeenCalled()
    expect(resultado.questoes).toEqual([{ id: 22 }])
  })

  it('na criação (sem simulado salvo) não chama a API', async () => {
    const desvincular = vi.fn().mockResolvedValue(undefined)
    const questoes = [{ id: 11 }, { id: 22 }]

    const resultado = await removerQuestaoDoSimulado({
      questoes,
      indice: 1,
      simuladoId: null,
      desvincular,
    })

    expect(desvincular).not.toHaveBeenCalled()
    expect(resultado.questoes).toEqual([{ id: 11 }])
  })
})
