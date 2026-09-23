import { describe, expect, it } from 'vitest'

import {
  acertouVisivel,
  correcaoDisponivel,
  estadoDaAlternativa,
  statusDaQuestaoConfirmada,
} from './feedbackProva'

describe('correcaoDisponivel', () => {
  it('nao libera a correcao enquanto o servidor nao manda o gabarito', () => {
    expect(correcaoDisponivel(null)).toBe(false)
    expect(correcaoDisponivel(undefined)).toBe(false)
  })

  it('libera a correcao quando o gabarito chega (tentativa concluida)', () => {
    expect(correcaoDisponivel({})).toBe(true)
    expect(correcaoDisponivel({ '10': true })).toBe(true)
  })
})

describe('acertouVisivel', () => {
  it('nao revela acerto antes do gabarito, mesmo com a resposta confirmada', () => {
    expect(acertouVisivel({ mostrarCorrecao: false, acertou: true })).toBe(false)
  })

  it('revela o acerto quando a correcao esta disponivel', () => {
    expect(acertouVisivel({ mostrarCorrecao: true, acertou: true })).toBe(true)
    expect(acertouVisivel({ mostrarCorrecao: true, acertou: false })).toBe(false)
  })
})

describe('estadoDaAlternativa', () => {
  it('durante a prova a alternativa escolhida fica selecionada, nunca errada', () => {
    expect(estadoDaAlternativa({ revelada: false, correta: false, selecionada: true })).toBe('selected')
    expect(estadoDaAlternativa({ revelada: false, correta: false, selecionada: false })).toBe('default')
  })

  it('com o gabarito em maos marca a correta e a resposta errada do aluno', () => {
    expect(estadoDaAlternativa({ revelada: true, correta: true, selecionada: false })).toBe('correct')
    expect(estadoDaAlternativa({ revelada: true, correta: false, selecionada: true })).toBe('incorrect')
    expect(estadoDaAlternativa({ revelada: true, correta: false, selecionada: false })).toBe('default')
  })
})

describe('statusDaQuestaoConfirmada', () => {
  it('questao confirmada sem gabarito fica apenas respondida', () => {
    expect(statusDaQuestaoConfirmada({ temGabarito: false, acertou: true })).toBe('answered')
    expect(statusDaQuestaoConfirmada({ temGabarito: false, acertou: false })).toBe('answered')
  })

  it('com o gabarito a questao confirmada fica verde ou vermelha', () => {
    expect(statusDaQuestaoConfirmada({ temGabarito: true, acertou: true })).toBe('correct')
    expect(statusDaQuestaoConfirmada({ temGabarito: true, acertou: false })).toBe('incorrect')
  })
})
