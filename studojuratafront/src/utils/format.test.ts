import { describe, expect, it } from 'vitest'

import {
  deInputDataHora,
  formatarCargaHoraria,
  formatarCep,
  formatarCpf,
  formatarData,
  formatarHora,
  formatarNota,
  formatarPeriodo,
  formatarTelefone,
  formatarTempo,
  horaParaMinutos,
  horasParaHHmm,
  iniciais,
  nomeCurto,
  normalizar,
} from './format'

describe('documentos e contato', () => {
  it('formata CPF, CEP e telefone', () => {
    expect(formatarCpf('80000000167')).toBe('800.000.001-67')
    expect(formatarCep('01310100')).toBe('01310-100')
    expect(formatarTelefone('11981000001')).toBe('(11) 98100-0001')
    expect(formatarTelefone('1130010000')).toBe('(11) 3001-0000')
  })

  it('mostra traço para valor vazio', () => {
    expect(formatarCpf('')).toBe('—')
    expect(formatarCep(null)).toBe('—')
    expect(formatarTelefone(undefined)).toBe('—')
  })
})

describe('datas e horas', () => {
  it('não recua um dia em datas sem horário', () => {
    expect(formatarData('2026-07-20')).toBe('20/07/2026')
  })

  it('formata período por mês/ano', () => {
    expect(formatarPeriodo('2026-02-02', '2026-12-18')).toBe('fev/2026 – dez/2026')
    expect(formatarPeriodo('2026-02-02', null)).toBe('fev/2026')
    expect(formatarPeriodo(null, null)).toBe('—')
  })

  it('converte horas', () => {
    expect(formatarHora('08:00:00')).toBe('08:00')
    expect(horaParaMinutos('09:30:00')).toBe(570)
    expect(horasParaHHmm(1.5)).toBe('01:30')
    expect(deInputDataHora('2026-07-20T11:00')).toBe('2026-07-20T11:00:00')
    expect(deInputDataHora('')).toBeNull()
  })

  it('formata tempo e carga horária', () => {
    expect(formatarTempo(90)).toBe('01:30')
    expect(formatarTempo(3725)).toBe('01:02:05')
    expect(formatarCargaHoraria(1.5)).toBe('1h30')
    expect(formatarCargaHoraria(60)).toBe('60h')
  })
})

describe('textos', () => {
  it('formata nota com vírgula', () => {
    expect(formatarNota(8)).toBe('8,0')
    expect(formatarNota(null)).toBe('—')
  })

  it('abrevia nomes', () => {
    expect(nomeCurto('Enzo Ferreira Lima')).toBe('Enzo Lima')
    expect(iniciais('Enzo Ferreira Lima')).toBe('EL')
    expect(iniciais('')).toBe('?')
  })

  it('normaliza acentos e caixa para busca', () => {
    expect(normalizar('Júnior ÁRVORE')).toBe('junior arvore')
  })
})
