import { describe, expect, it } from 'vitest'

import { dataDigitadaParaIso, dataIsoParaExibicao } from './conversaoData'

describe('dataDigitadaParaIso', () => {
  it('converte dia/mês/ano digitado para o ISO que a API recebe', () => {
    expect(dataDigitadaParaIso('15/01/2026')).toBe('2026-01-15')
    // Sem zero à esquerda continua sendo dia/mês/ano.
    expect(dataDigitadaParaIso('1/1/2026')).toBe('2026-01-01')
  })

  it('aceita o que se digita sem as barras — o campo da Mantine não tem máscara', () => {
    expect(dataDigitadaParaIso('15012026')).toBe('2026-01-15')
    expect(dataDigitadaParaIso('15-01-2026')).toBe('2026-01-15')
  })

  it('recusa formato ambíguo e data impossível', () => {
    // Mês/dia (formato americano) e ISO invertido continuam recusados: trocar
    // dia por mês em silêncio é exatamente o que os formatos declarados evitam.
    expect(dataDigitadaParaIso('2026-01-15')).toBeNull()
    expect(dataDigitadaParaIso('01/15/2026')).toBeNull()
    expect(dataDigitadaParaIso('31/02/2026')).toBeNull()
    expect(dataDigitadaParaIso('')).toBeNull()
  })
})

describe('dataIsoParaExibicao', () => {
  it('mostra a data persistida no formato do projeto', () => {
    expect(dataIsoParaExibicao('2026-01-15')).toBe('15/01/2026')
  })

  it('ida e volta preserva o dia (sem perder um dia por fuso)', () => {
    const iso = dataDigitadaParaIso('01/03/2026')

    expect(iso).toBe('2026-03-01')
    expect(dataIsoParaExibicao(iso)).toBe('01/03/2026')
  })

  it('valor vazio vira texto vazio', () => {
    expect(dataIsoParaExibicao('')).toBe('')
    expect(dataIsoParaExibicao(null)).toBe('')
    expect(dataIsoParaExibicao(undefined)).toBe('')
  })
})
