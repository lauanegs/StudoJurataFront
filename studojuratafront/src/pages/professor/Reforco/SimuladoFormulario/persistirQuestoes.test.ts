import { describe, expect, it, vi } from 'vitest'

import { salvarQuestoesDoSimulado, type ApiDasQuestoes } from './persistirQuestoes'
import type { QuestaoEditavel } from '@/components/simulados/QuestaoEditor/types'

function apiFalsa() {
  const chamadas: string[] = []
  const registrar = (nome: string) => {
    chamadas.push(nome)
  }
  const mocks = {
    criarQuestao: vi.fn(async () => {
      registrar('criarQuestao')
      return { id: 500 }
    }),
    atualizarQuestao: vi.fn(async (id: number) => {
      registrar('atualizarQuestao')
      return { id }
    }),
    vincularConteudo: vi.fn(async () => registrar('vincularConteudo')),
    criarAlternativa: vi.fn(async () => registrar('criarAlternativa')),
    atualizarAlternativa: vi.fn(async () => registrar('atualizarAlternativa')),
    vincularAoSimulado: vi.fn(async () => registrar('vincularAoSimulado')),
  }
  return { api: mocks as unknown as ApiDasQuestoes, chamadas, mocks }
}

const questaoNova = (extra: Partial<QuestaoEditavel> = {}): QuestaoEditavel =>
  ({
    enunciado: '  Qual?  ',
    tipo: 'ALTERNATIVAS',
    disciplinaId: null,
    nivelDificuldade: 'MEDIA',
    alternativas: [
      { texto: 'a', correta: true },
      { texto: '   ', correta: false },
      { texto: 'b', correta: false },
    ],
    conteudoPlanoIdsPendentes: [7],
    ...extra,
  }) as QuestaoEditavel

describe('salvarQuestoesDoSimulado', () => {
  it('questão nova: conteúdos são vinculados antes de entrar no simulado', async () => {
    const { api, chamadas } = apiFalsa()

    await salvarQuestoesDoSimulado({ simuladoId: 1, questoes: [questaoNova()], disciplinaId: 9, notaMaxima: 10 }, api)

    expect(chamadas.indexOf('vincularConteudo')).toBeLessThan(chamadas.indexOf('vincularAoSimulado'))
    expect(chamadas[0]).toBe('criarQuestao')
  })

  it('ignora alternativa em branco e limpa o enunciado', async () => {
    const { api, mocks } = apiFalsa()

    await salvarQuestoesDoSimulado({ simuladoId: 1, questoes: [questaoNova()], disciplinaId: 9, notaMaxima: null }, api)

    expect(mocks.criarAlternativa).toHaveBeenCalledTimes(2)
    expect(mocks.criarQuestao).toHaveBeenCalledWith(expect.objectContaining({ enunciado: 'Qual?', disciplinaId: 9 }))
  })

  it('divide a nota máxima igualmente entre as questões', async () => {
    const { api, mocks } = apiFalsa()

    await salvarQuestoesDoSimulado(
      { simuladoId: 1, questoes: [questaoNova(), questaoNova()], disciplinaId: 9, notaMaxima: 10 },
      api,
    )

    expect(mocks.vincularAoSimulado).toHaveBeenNthCalledWith(1, expect.objectContaining({ ordem: 1, pontuacao: 5 }))
    expect(mocks.vincularAoSimulado).toHaveBeenNthCalledWith(2, expect.objectContaining({ ordem: 2, pontuacao: 5 }))
  })

  it('questão já salva é atualizada e não é vinculada de novo', async () => {
    const { api, mocks } = apiFalsa()
    const existente = questaoNova({ id: 42, conteudoPlanoIdsPendentes: [] })

    await salvarQuestoesDoSimulado({ simuladoId: 1, questoes: [existente], disciplinaId: 9, notaMaxima: 10 }, api)

    expect(mocks.atualizarQuestao).toHaveBeenCalledWith(42, expect.anything())
    expect(mocks.criarQuestao).not.toHaveBeenCalled()
    expect(mocks.vincularAoSimulado).not.toHaveBeenCalled()
  })
})
