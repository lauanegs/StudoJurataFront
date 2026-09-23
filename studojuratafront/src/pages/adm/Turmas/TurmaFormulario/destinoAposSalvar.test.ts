import { describe, expect, it } from 'vitest'

import { rotaDaTurmaCriada } from './destinoAposSalvar'

describe('rotaDaTurmaCriada', () => {
  it('leva para o formulário da turma criada (mesma tela, agora em modo de edição)', () => {
    expect(rotaDaTurmaCriada({ id: 7 })).toBe('/adm/turmas/7')
  })

  it('nunca manda o usuário para a listagem depois de salvar', () => {
    expect(rotaDaTurmaCriada({ id: 7 })).not.toBe('/adm/turmas')
  })

  it('sem id na resposta, permanece na tela atual', () => {
    expect(rotaDaTurmaCriada(null)).toBeNull()
    expect(rotaDaTurmaCriada(undefined)).toBeNull()
    expect(rotaDaTurmaCriada({})).toBeNull()
  })
})
